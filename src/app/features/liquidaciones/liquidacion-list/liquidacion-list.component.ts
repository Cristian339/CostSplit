import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { LiquidacionService } from '../../../services/liquidacion.service';
import { LiquidacionDTO } from '../../../models/liquidacion.model';
import { EstadoLiquidacion } from '../../../models/enums';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component';

@Component({
  selector: 'app-liquidacion-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    LoadingComponent,
    ErrorMessageComponent
  ],
  templateUrl: './liquidacion-list.component.html',
  styleUrls: ['./liquidacion-list.component.scss']
})
export class LiquidacionListComponent implements OnInit {
  liquidaciones: LiquidacionDTO[] = [];
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
      next: (liquidaciones) => {
        // Aseguramos que los datos cumplen con el modelo requerido
        this.liquidaciones = liquidaciones.map(liq => ({
          ...liq,
          pagadorId: liq.pagadorId || 0,
          receptorId: liq.receptorId || 0,
          importe: liq.importe || 0
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando liquidaciones:', error);
        this.errorMessage = 'No se pudieron cargar las liquidaciones';
        this.isLoading = false;
      }
    });
  }

  async cambiarEstado(liquidacion: LiquidacionDTO, nuevoEstado: EstadoLiquidacion) {
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
              next: (liquidacionActualizada) => {
                // Actualizar la liquidación en la lista con valores completos
                const index = this.liquidaciones.findIndex(l => l.id === liquidacion.id);
                if (index !== -1) {
                  // Añadimos los campos requeridos si no existen
                  this.liquidaciones[index] = {
                    ...liquidacionActualizada,
                    pagadorId: liquidacionActualizada.pagadorId || liquidacion.pagadorId,
                    receptorId: liquidacionActualizada.receptorId || liquidacion.receptorId,
                    importe: liquidacionActualizada.importe || liquidacion.importe
                  };
                }

                this.isLoading = false;
                this.mostrarToast(
                  `Liquidación ${nuevoEstado === EstadoLiquidacion.CONFIRMADA ? 'confirmada' : 'rechazada'} correctamente`,
                  'success'
                );
              },
              error: (error) => {
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

  getColorEstado(estado: EstadoLiquidacion): string {
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
