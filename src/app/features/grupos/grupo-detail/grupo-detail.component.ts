import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonicModule, AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { GrupoService } from '../../../services/grupo.service';
import { GastoService } from '../../../services/gasto.service';
import { UsuarioService } from '../../../services/usuario.service';
import { GrupoDetalladoDTO } from '../../../models/grupo.model';
import { GastoDTO } from '../../../models/gasto.model';
import { UsuarioDTO } from '../../../models/usuario.model';
import { AuthService } from '../../../services/auth.service';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component';

@Component({
  selector: 'app-grupo-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterLink,
    LoadingComponent,
    ErrorMessageComponent
  ],
  templateUrl: './grupo-detail.component.html',
  styleUrls: ['./grupo-detail.component.scss']
})
export class GrupoDetailComponent implements OnInit {
  grupo?: GrupoDetalladoDTO;
  gastos: GastoDTO[] = [];
  grupoId: number = 0;
  isLoading = false;
  errorMessage = '';
  currentUser?: UsuarioDTO | null;
  segment = 'info';

  constructor(
    private grupoService: GrupoService,
    private gastoService: GastoService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.grupoId = +params['id'];
        this.cargarGrupo();
      } else {
        this.router.navigate(['/grupos']);
      }
    });
  }

  cargarGrupo() {
    this.isLoading = true;
    this.errorMessage = '';

    this.grupoService.obtenerGrupo(this.grupoId).subscribe({
      next: (grupo) => {
        this.grupo = grupo;
        this.isLoading = false;
        this.cargarGastos();
      },
      error: (error) => {
        console.error('Error cargando grupo:', error);
        this.errorMessage = 'No se pudo cargar la información del grupo';
        this.isLoading = false;
      }
    });
  }

  cargarGastos() {
    this.gastoService.listarGastosPorGrupo(this.grupoId).subscribe({
      next: (gastos) => {
        this.gastos = gastos;
      },
      error: (error) => {
        console.error('Error cargando gastos:', error);
        // No mostramos error aquí para no sobrecargar la interfaz
      }
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Añadir participantes',
          icon: 'person-add',
          handler: () => {
            this.mostrarModalAddParticipantes();
          }
        },
        {
          text: 'Editar grupo',
          icon: 'create',
          handler: () => {
            // Implementar edición de grupo
          }
        },
        {
          text: 'Salir del grupo',
          icon: 'exit',
          role: 'destructive',
          handler: () => {
            this.confirmarSalirGrupo();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async mostrarModalAddParticipantes() {
    // Obtener usuarios que no están en el grupo
    this.usuarioService.obtenerUsuarios().subscribe({
      next: async (usuarios) => {
        // Filtrar usuarios que ya están en el grupo
        const usuariosNoEnGrupo = usuarios.filter(
          u => !this.grupo?.usuarios.some(gu => gu.id === u.id)
        );

        if (usuariosNoEnGrupo.length === 0) {
          const toast = await this.toastController.create({
            message: 'No hay más usuarios disponibles para añadir',
            duration: 2000,
            color: 'warning'
          });
          await toast.present();
          return;
        }

        const inputs = usuariosNoEnGrupo.map(u => ({
          type: 'checkbox',
          label: `${u.nombre} ${u.apellido}`,
          value: u.id,
          checked: false
        }));

        const alert = await this.alertController.create({
          header: 'Añadir Participantes',
          inputs,
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Añadir',
              handler: (selectedUserIds) => {
                if (selectedUserIds && selectedUserIds.length > 0) {
                  this.aniadirParticipantes(selectedUserIds);
                }
              }
            }
          ]
        });

        await alert.present();
      },
      error: async (error) => {
        console.error('Error obteniendo usuarios:', error);
        const toast = await this.toastController.create({
          message: 'No se pudieron cargar los usuarios',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  aniadirParticipantes(idUsuarios: number[]) {
    this.grupoService.aniadirParticipantes(this.grupoId, { idUsuarios }).subscribe({
      next: async (grupoActualizado) => {
        this.grupo = grupoActualizado;
        const toast = await this.toastController.create({
          message: 'Participantes añadidos correctamente',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
      },
      error: async (error) => {
        console.error('Error añadiendo participantes:', error);
        const toast = await this.toastController.create({
          message: 'Error al añadir participantes',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  async confirmarSalirGrupo() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de que quieres salir del grupo?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salir',
          role: 'destructive',
          handler: () => {
            if (this.currentUser?.id) {
              this.salirDelGrupo(this.currentUser.id);
            }
          }
        }
      ]
    });

    await alert.present();
  }

  salirDelGrupo(idUsuario: number) {
    this.grupoService.eliminarParticipantes(this.grupoId, { idUsuarios: [idUsuario] }).subscribe({
      next: async () => {
        const toast = await this.toastController.create({
          message: 'Has salido del grupo correctamente',
          duration: 2000,
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/grupos']);
      },
      error: async (error) => {
        console.error('Error al salir del grupo:', error);
        const toast = await this.toastController.create({
          message: 'Error al salir del grupo',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
      }
    });
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  verGastos() {
    this.router.navigate(['/grupos', this.grupoId, 'gastos']);
  }

  verBalances() {
    this.router.navigate(['/grupos', this.grupoId, 'balances']);
  }

  doRefresh(event: any) {
    this.cargarGrupo();
    event.target.complete();
  }
}
