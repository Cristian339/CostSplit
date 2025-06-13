import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GrupoService } from '../services/grupo.service';
import { GastoService } from '../services/gasto.service';
import { BalanceService } from '../services/balance.service';
import { GastoDTO } from '../models/gasto.model';
import { BalanceDTO } from '../models/balance.model';
import { GrupoDTO } from '../models/grupo.model';
import { TipoGasto, MetodoPago, MetodoReparticion } from '../models/enums';
import { Divisa } from '../models/divisa.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  gruposRecientes: GrupoDTO[] = [];
  ultimosGastos: GastoDTO[] = [];
  balancesPendientes: BalanceDTO[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private grupoService: GrupoService,
    private gastoService: GastoService,
    private balanceService: BalanceService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.isLoading = true;

    // Obtener el usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.isLoading = false;
      return;
    }

    // Cargar los grupos del usuario
    this.grupoService.listarGrupos(currentUser.id).subscribe({
      next: (grupos) => {
        // Asegurar que descripcion es siempre string
        this.gruposRecientes = grupos.slice(0, 3).map(grupo => ({
          ...grupo,
          descripcion: grupo.descripcion || ''
        }));

        // Si hay grupos, cargamos los gastos recientes del primer grupo
        if (grupos.length > 0) {
          this.gastoService.listarGastosPorGrupo(grupos[0].id!).subscribe({
            next: (gastos) => {
              // Convertir string a los tipos enum correspondientes
              this.ultimosGastos = gastos.slice(0, 5).map(gasto => ({
                ...gasto,
                tipoGasto: gasto.tipoGasto as TipoGasto,
                metodoPago: gasto.metodoPago as MetodoPago,
                metodoReparticion: gasto.metodoReparticion as MetodoReparticion,
                divisa: Divisa[gasto.divisa as keyof typeof Divisa] // Conversión correcta a enum Divisa
              }));

              // Cargar los balances del primer grupo
              this.balanceService.obtenerBalancesPorGrupo(grupos[0].id!).subscribe({
                next: (balances) => {
                  this.balancesPendientes = balances.filter(b => b.importe < 0);
                  this.isLoading = false;
                },
                error: (error) => {
                  console.error('Error cargando balances:', error);
                  this.isLoading = false;
                }
              });
            },
            error: (error) => {
              console.error('Error cargando gastos:', error);
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error cargando grupos:', error);
        this.isLoading = false;
      }
    });
  }

  doRefresh(event: any) {
    this.cargarDatos();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getIconoTipoGasto(tipo: string): string {
    switch(tipo) {
      case 'COMIDA': return 'restaurant';
      case 'TRANSPORTE': return 'car';
      case 'ALOJAMIENTO': return 'bed';
      case 'OCIO': return 'game-controller';
      case 'OTROS':
      default: return 'pricetag';
    }
  }
}
