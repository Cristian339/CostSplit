import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

interface ExchangeRates {
  [key: string]: number;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  // URL a una API de tasas de cambio (ejemplo: Exchange Rates API)
  private apiUrl = 'https://api.exchangerate-api.com/v4/latest/EUR';
  
  private exchangeRates = new BehaviorSubject<ExchangeRates>({});
  private lastUpdate: Date | null = null;
  private updateInterval = 24 * 60 * 60 * 1000; // 24 horas

  constructor(private http: HttpClient) {
    this.loadExchangeRates();
  }

  /**
   * Carga las tasas de cambio desde la API o desde el almacenamiento local
   */
  private loadExchangeRates(): void {
    // Verificar si tenemos tasas actualizadas en localStorage
    const storedRates = localStorage.getItem('exchangeRates');
    const lastUpdateTime = localStorage.getItem('exchangeRatesUpdate');
    
    if (storedRates && lastUpdateTime) {
      const updateTime = new Date(lastUpdateTime);
      const now = new Date();
      
      // Si las tasas almacenadas están actualizadas (menos de 24 horas)
      if ((now.getTime() - updateTime.getTime()) < this.updateInterval) {
        this.exchangeRates.next(JSON.parse(storedRates));
        this.lastUpdate = updateTime;
        return;
      }
    }
    
    // Si no hay tasas actualizadas, obtener de la API
    this.fetchExchangeRates().subscribe();
  }

  /**
   * Obtiene las tasas de cambio actualizadas desde la API
   */
  private fetchExchangeRates(): Observable<ExchangeRates> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.rates as ExchangeRates),
      tap(rates => {
        this.lastUpdate = new Date();
        this.exchangeRates.next(rates);
        
        // Almacenar en localStorage
        localStorage.setItem('exchangeRates', JSON.stringify(rates));
        localStorage.setItem('exchangeRatesUpdate', this.lastUpdate.toISOString());
      }),
      catchError(error => {
        console.error('Error fetching exchange rates', error);
        return of({});
      })
    );
  }

  /**
   * Convierte un importe de una divisa a otra
   */
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    const rates = this.exchangeRates.value;
    
    // Si las divisas son iguales, no hay conversión necesaria
    if (fromCurrency === toCurrency) {
      return amount;
    }
    
    // Si no hay tasas disponibles
    if (!rates || !Object.keys(rates).length) {
      return amount; // Retornar el mismo importe si no podemos convertir
    }
    
    // Convertir a través de la divisa base (EUR en este caso)
    if (fromCurrency !== 'EUR') {
      amount = amount / rates[fromCurrency];
    }
    
    if (toCurrency !== 'EUR') {
      amount = amount * rates[toCurrency];
    }
    
    return parseFloat(amount.toFixed(2));
  }

  /**
   * Obtiene la lista de divisas disponibles
   */
  getAvailableCurrencies(): Observable<string[]> {
    return this.exchangeRates.asObservable().pipe(
      map(rates => Object.keys(rates).concat('EUR'))
    );
  }
}
