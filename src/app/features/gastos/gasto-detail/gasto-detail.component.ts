import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { GastoService } from '../../../services/gasto.service';
import { GrupoService } from '../../../services/grupo.service';
import { GastoDTO, DetalleGastoDTO } from '../../../models/gasto.model';
import { GrupoDetalladoDTO } from '../../../models/grupo.model';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component';

@Component({
  selector: 'app-gasto-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    LoadingComponent,
    ErrorMessageComponent
  ],
  templateUrl: './gasto-detail.component.html',
  styleUrls: ['./gasto-detail.component.scss']
})
export class GastoDetailComponent implements OnInit {
  gasto?: GastoDTO;
  detalles: DetalleGastoDTO[] = [];
  grupo?: GrupoDetalladoDTO;
  gastoId: number = 0;
  grupoId: number = 0;
  isLoading = false;
  errorMessage = '';

  constructor(
    private gastoService: GastoService,
    private grupoService: GrupoService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['idGasto'] && params['idGrupo']) {
        this.gastoId = +params['idGasto'];
        this.grupoId = +params['idGrupo'];
        this.cargarDatos();
      } else {
        this.router.navigate(['/grupos']);
      }
    });
  }

  cargarDatos() {
    this.isLoading = true;
    this.errorMessage = '';

    // Cargar información del grupo
    this.grupoService.obtenerGrupo(this.grupoId).subscribe({
      next: (grupo) => {
        this.grupo = grupo;

        // Cargar información del gasto
        this.gastoService.obtenerGasto(this.gastoId).subscribe({
          next: (gasto) => {
            this.gasto = gasto;
            this.cargarDetallesGasto();
          },
          error: (error) => {
            console.error('Error cargando gasto:', error);
            this.errorMessage = 'No se pudo cargar la información del gasto';
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error cargando grupo:', error);
        this.errorMessage = 'No se pudo cargar la información del grupo';
        this.isLoading = false;
      }
    });
  }

  cargarDetallesGasto() {
    this.gastoService.listarDetallesGasto(this.gastoId).subscribe({
      next: (detalles) => {
        this.detalles = detalles;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando detalles del gasto:', error);
        this.errorMessage = 'No se pudieron cargar los detalles del gasto';
        this.isLoading = false;
      }
    });
  }

  getNombrePagador(): string {
    if (!this.gasto || !this.grupo) return 'Desconocido';
    const pagador = this.grupo.usuarios.find(u => u.id === this.gasto?.idPagador);
    return pagador ? `${pagador.nombre} ${pagador.apellido}` : 'Desconocido';
  }

  getIconoTipoGasto(tipo: string = ''): string {
    switch(tipo) {
      case 'COMIDA': return 'restaurant';
      case 'TRANSPORTE': return 'car';
      case 'ALOJAMIENTO': return 'bed';
      case 'OCIO': return 'game-controller';
      case 'OTROS':
      default: return 'pricetag';
    }
  }

  getIconoMetodoPago(metodo: string = ''): string {
    switch(metodo) {
      case 'EFECTIVO': return 'cash';
      case 'TARJETA': return 'card';
      case 'TRANSFERENCIA': return 'swap-horizontal';
      case 'BIZUM': return 'phone-portrait';
      default: return 'cash';
    }
  }

  getNombreUsuario(idUsuario: number): string {
    if (!this.grupo) return 'Desconocido';
    const usuario = this.grupo.usuarios.find(u => u.id === idUsuario);
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Desconocido';
  }

  volverAGastos() {
    this.router.navigate(['/grupos', this.grupoId, 'gastos']);
  }

  async confirmarEliminar() {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: '¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.eliminarGasto();
          }
        }
      ]
    });

    await alert.present();
  }

  eliminarGasto() {
    // Esta función es un placeholder. Implementar cuando se tenga el endpoint correspondiente
    // this.gastoService.eliminarGasto(this.gastoId).subscribe({...});

    // Mostrar un toast informativo
    this.mostrarToast('Funcionalidad no implementada', 'warning');

    // Redirigir a la lista de gastos
    this.volverAGastos();
  }

  async mostrarToast(mensaje: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color
    });
    await toast.present();
  }

  doRefresh(event: any) {
    this.cargarDatos();
    event.target.complete();
  }
}
