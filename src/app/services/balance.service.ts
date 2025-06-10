import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BalanceDTO } from '../models/balance.model';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private apiUrl = '/api/balances';

  constructor(private http: HttpClient) {}

  obtenerBalancesPorGrupo(idGrupo: number): Observable<BalanceDTO[]> {
    return this.http.get<BalanceDTO[]>(`${this.apiUrl}?idGrupo=${idGrupo}`);
  }

  obtenerBalanceUsuario(idGrupo: number, idUsuario: number): Observable<BalanceDTO> {
    return this.http.get<BalanceDTO>(`${this.apiUrl}/usuario?idGrupo=${idGrupo}&idUsuario=${idUsuario}`);
  }
}
