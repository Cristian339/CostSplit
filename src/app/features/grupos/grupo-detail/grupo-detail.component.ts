import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule, AlertController, ActionSheetController } from '@ionic/angular';
import { GrupoDTO } from '../../../models/grupo.model';
import { GastoDTO } from '../../../models/gasto.model';
import { UsuarioDTO } from '../../../models/usuario.model';
import { TipoGasto } from '../../../models/enums';
import { GrupoService } from '../../../services/grupo.service';
import { GastoService } from '../../../services/gasto.service';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-grupo-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  templateUrl: './grupo-detail.component.html',
  styleUrls: ['./grupo-detail.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GrupoDetailComponent implements OnInit {
  grupoId: number = 0;
  grupo: GrupoDTO | null = null;
  gastos: GastoDTO[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  currentUser: UsuarioDTO | null = null;
  segment: string = 'info';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grupoService: GrupoService,
    private gastoService: GastoService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser() as UsuarioDTO;
    this.route.params.subscribe(params => {
      this.grupoId = +params['id'];
      this.cargarGrupo();
    });
  }

  cargarGrupo() {
    this.isLoading = true;
    this.errorMessage = '';

    this.grupoService.obtenerGrupo(this.grupoId).subscribe({
      next: (grupo: any) => {
        this.grupo = grupo;
        this.cargarGastos();
      },
      error: (error: any) => {
        console.error('Error al cargar el grupo', error);
        this.errorMessage = 'No se pudo cargar la información del grupo.';
        this.isLoading = false;
      }
    });
  }

  cargarGastos() {
    this.gastoService.listarGastosPorGrupo(this.grupoId).subscribe({
      next: (gastos) => {
        this.gastos = gastos.map(g => ({
          ...g,
          tipoGasto: this.convertirTipoGasto(g.tipoGasto)
        })) as GastoDTO[];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar los gastos', error);
        this.errorMessage = 'No se pudieron cargar los gastos del grupo.';
        this.isLoading = false;
      }
    });
  }

  convertirTipoGasto(tipo: any): TipoGasto {
    if (typeof tipo === 'string') {
      switch (tipo.toUpperCase()) {
        case 'COMIDA': return TipoGasto.COMIDA;
        case 'TRANSPORTE': return TipoGasto.TRANSPORTE;
        case 'ALOJAMIENTO': return TipoGasto.ALOJAMIENTO;
        case 'OCIO': return TipoGasto.OCIO;
        default: return TipoGasto.OTROS;
      }
    }
    return tipo;
  }

  doRefresh(event: any) {
    this.cargarGrupo();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  segmentChanged(event: any) {
    this.segment = event.detail.value;
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones',
      buttons: [
        {
          text: 'Editar grupo',
          icon: 'create-outline',
          handler: () => {
            this.router.navigate(['/grupos', this.grupoId, 'editar']);
          }
        },
        {
          text: 'Añadir participantes',
          icon: 'person-add-outline',
          handler: () => {
            this.mostrarModalAddParticipantes();
          }
        },
        {
          text: 'Abandonar grupo',
          icon: 'exit-outline',
          role: 'destructive',
          handler: () => {
            this.confirmarAbandonarGrupo();
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
    // Usar any para evitar errores de tipo y facilitar la compilación
    (this.usuarioService as any).getAll().subscribe({
      next: async (usuarios: any[]) => {
        const participantes = this.obtenerParticipantes();
        const participantesIds = participantes.map((p: any) => p.id);

        const usuariosNoEnGrupo = usuarios.filter(u => !participantesIds.includes(u.id));

        if (usuariosNoEnGrupo.length === 0) {
          const alert = await this.alertController.create({
            header: 'Información',
            message: 'No hay más usuarios disponibles para añadir al grupo.',
            buttons: ['OK']
          });
          await alert.present();
          return;
        }

        const inputs = usuariosNoEnGrupo.map((u: any) => ({
          type: 'checkbox' as const,
          label: `${u.nombre} ${u.apellido}`,
          value: u.id,
          checked: false
        }));

        const alert = await this.alertController.create({
          header: 'Añadir participantes',
          inputs: inputs,
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            }, {
              text: 'Añadir',
              handler: (data) => {
                if (data && data.length > 0) {
                  this.aniadirParticipantes(data);
                }
              }
            }
          ]
        });

        await alert.present();
      },
      error: (error: any) => {
        console.error('Error al obtener usuarios', error);
      }
    });
  }

  obtenerParticipantes(): any[] {
    // Usar casting a any para acceder a participantes de manera segura
    const grupoAny = this.grupo as any;

    // Intentar obtener participantes de acuerdo a la estructura real
    return grupoAny?.participantes || [];
  }

  obtenerNumParticipantes(): number {
    return this.obtenerParticipantes().length;
  }

  aniadirParticipantes(idsUsuarios: number[]) {
    if (!idsUsuarios || idsUsuarios.length === 0) return;

    this.grupoService.aniadirParticipantes(this.grupoId, { idsUsuarios }).subscribe({
      next: () => {
        this.cargarGrupo();
      },
      error: (error: any) => {
        console.error('Error al añadir participantes', error);
      }
    });
  }

  async confirmarAbandonarGrupo() {
    const alert = await this.alertController.create({
      header: '¿Abandonar grupo?',
      message: '¿Estás seguro que deseas abandonar este grupo? No podrás acceder a la información del grupo después de abandonarlo.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        }, {
          text: 'Abandonar',
          handler: () => {
            this.abandonarGrupo();
          }
        }
      ]
    });

    await alert.present();
  }

  abandonarGrupo() {
    if (!this.currentUser?.id) return;

    const idUsuario = this.currentUser.id;

    this.grupoService.eliminarParticipantes(this.grupoId, { idsUsuarios: [idUsuario] }).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (error: any) => {
        console.error('Error al abandonar el grupo', error);
      }
    });
  }

  getTotalGastos(): number {
    return this.gastos.reduce((total, gasto) => total + (gasto.montoTotal || 0), 0);
  }

  verDetalleGasto(gastoId: number) {
    this.router.navigate(['/grupos', this.grupoId, 'gastos', gastoId]);
  }

  getIconoTipoGasto(tipo: TipoGasto | string): string {
    switch(String(tipo).toUpperCase()) {
      case 'COMIDA': return 'restaurant';
      case 'TRANSPORTE': return 'car';
      case 'ALOJAMIENTO': return 'bed';
      case 'OCIO': return 'game-controller';
      case 'OTROS':
      default: return 'pricetag';
    }
  }

  verGastos() {
    this.router.navigate(['/grupos', this.grupoId, 'gastos']);
  }

  verBalances() {
    this.router.navigate(['/grupos', this.grupoId, 'liquidaciones']);
  }
}
