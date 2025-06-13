import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LiquidacionService } from '../../../services/liquidacion.service';
import { LiquidacionDTO } from '../../../models/liquidacion.model';
import { EstadoLiquidacion } from '../../../models/enums';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component';

interface LiquidacionExtendida extends LiquidacionDTO {
  pagadorId: number;
  receptorId: number;
  importe: number;
  pagadorNombre?: string;
  receptorNombre?: string;
}

@Component({
  selector: 'app-liquidacion-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    LoadingComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './liquidacion-list.component.html',
  styleUrls: ['./liquidacion-list.component.scss']
})
export class LiquidacionListComponent implements OnInit {
  liquidaciones: LiquidacionExtendida[] = [];
  grupoId: number = 0;
  isLoading = false;
  errorMessage = '';

  // Enums para usar en el template
  EstadoLiquidacion = EstadoLiquidacion;

  constructor(
    private liquidacionService: LiquidacionService,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['idGrupo']) {
        this.grupoId = +params['idGrupo'];
        this.cargarLiquidaciones();
      } else {
        this.router.navigate(['/grupos']);
      }
    });
  }

  cargarLiquidaciones() {
    this.isLoading = true;
    this.errorMessage = '';

    this.liquidacionService.obtenerLiquidacionesPorGrupo(this.grupoId).subscribe({
      next: (liquidaciones: any[]) => {
        // Convertimos las liquidaciones del servicio a nuestro modelo extendido
        this.liquidaciones = liquidaciones.map(liq => ({
          ...liq,
          pagadorId: liq.pagadorId || liq.usuarioOrigenId || 0,
          receptorId: liq.receptorId || liq.usuarioDestinoId || 0,
          importe: liq.importe || liq.monto || 0,
          pagadorNombre: liq.pagadorNombre || `Usuario ${liq.usuarioOrigenId || 0}`,
          receptorNombre: liq.receptorNombre || `Usuario ${liq.usuarioDestinoId || 0}`,
          // Asegurar que el estado es del tipo correcto
          estado: typeof liq.estado === 'string' ? this.convertirEstado(liq.estado) : liq.estado
        }));
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error cargando liquidaciones:', error);
        this.errorMessage = 'No se pudieron cargar las liquidaciones';
        this.isLoading = false;
      }
    });
  }

  // Método para convertir estados en formato string al enum
  convertirEstado(estado: string): EstadoLiquidacion {
    switch (estado.toUpperCase()) {
      case 'CONFIRMADA':
      case 'CONFIRMADO':
        return EstadoLiquidacion.CONFIRMADA;
      case 'RECHAZADA':
      case 'RECHAZADO':
        return EstadoLiquidacion.RECHAZADA;
      default:
        return EstadoLiquidacion.PENDIENTE;
    }
  }

  async cambiarEstado(liquidacion: LiquidacionExtendida, nuevoEstado: EstadoLiquidacion) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro que deseas ${nuevoEstado === EstadoLiquidacion.CONFIRMADA ? 'confirmar' : 'rechazar'} esta liquidación?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.isLoading = true;

            this.liquidacionService.actualizarEstadoLiquidacion(liquidacion.id!, nuevoEstado).subscribe({
              next: (liquidacionActualizada: any) => {
                // Actualizar la liquidación en la lista
                const index = this.liquidaciones.findIndex(l => l.id === liquidacion.id);
                if (index !== -1) {
                  this.liquidaciones[index] = {
                    ...liquidacionActualizada,
                    pagadorId: liquidacionActualizada.pagadorId || liquidacion.pagadorId,
                    receptorId: liquidacionActualizada.receptorId || liquidacion.receptorId,
                    importe: liquidacionActualizada.importe || liquidacion.importe,
                    pagadorNombre: liquidacionActualizada.pagadorNombre || liquidacion.pagadorNombre,
                    receptorNombre: liquidacionActualizada.receptorNombre || liquidacion.receptorNombre
                  };
                }

                this.isLoading = false;
                this.mostrarToast(
                  `Liquidación ${nuevoEstado === EstadoLiquidacion.CONFIRMADA ? 'confirmada' : 'rechazada'} correctamente`,
                  'success'
                );
              },
              error: (error: any) => {
                console.error('Error al cambiar el estado:', error);
                this.isLoading = false;
                this.mostrarToast('Error al actualizar el estado', 'danger');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  async crearLiquidacion() {
    // Esta función debería abrir un modal o navegar a una pantalla para crear una liquidación
    // Por simplicidad, mostramos un mensaje
    const toast = await this.toastController.create({
      message: 'Funcionalidad en desarrollo',
      duration: 2000,
      color: 'warning'
    });
    await toast.present();
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color
    });
    await toast.present();
  }

  getColorEstado(estado?: EstadoLiquidacion): string {
    if (!estado) return 'warning';

    switch (estado) {
      case EstadoLiquidacion.CONFIRMADA:
        return 'success';
      case EstadoLiquidacion.RECHAZADA:
        return 'danger';
      default:
        return 'warning';
    }
  }

  doRefresh(event: any) {
    this.cargarLiquidaciones();
    event.target.complete();
  }
}
