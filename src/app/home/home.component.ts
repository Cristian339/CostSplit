import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GrupoService } from '../services/grupo.service';
import { GastoService } from '../services/gasto.service';
import { BalanceService } from '../services/balance.service';
import { GastoDTO } from '../models/gasto.model';
import { BalanceDTO } from '../models/balance.model';
import { GrupoDTO } from '../models/grupo.model';
import { TipoGasto, MetodoPago, MetodoReparticion } from '../models/enums';
import { Divisa } from '../models/divisa.model';
import { HeaderComponent } from '../components/header/header.component';
import { PerfilImagenDTO } from '../models/perfil-imagen.model';
import { UsuarioService } from '../services/usuario.service';
import { environment } from '../../environments/environment';

// Importación de iconos
import { addIcons } from 'ionicons';
import {
  peopleOutline, personCircleOutline, chevronForwardOutline, addCircleOutline,
  barChartOutline, personOutline, helpCircleOutline, add, restaurant, car,
  bed, gameController, pricetag, menuOutline, notificationsOutline
} from 'ionicons/icons';

// Registra elementos de Swiper
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Necesario para usar elementos web personalizados
})
export class HomeComponent implements OnInit {
  grupos: GrupoDTO[] = [];
  ultimosGastos: GastoDTO[] = [];
  balancesPendientes: BalanceDTO[] = [];
  isLoading = true;
  userName = '';

  // Propiedades para el header
  tieneNotificacionesPendientes: boolean = false;
  cantidadNotificaciones: number = 0;
  fotoUsuario: string = '';
  perfilImagen: PerfilImagenDTO | null = null;

  constructor(
    private authService: AuthService,
    private grupoService: GrupoService,
    private gastoService: GastoService,
    private balanceService: BalanceService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    addIcons({
      'people-outline': peopleOutline,
      'person-circle-outline': personCircleOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'add-circle-outline': addCircleOutline,
      'bar-chart-outline': barChartOutline,
      'person-outline': personOutline,
      'help-circle-outline': helpCircleOutline,
      'add': add,
      'restaurant': restaurant,
      'car': car,
      'bed': bed,
      'game-controller': gameController,
      'pricetag': pricetag,
      'menu-outline': menuOutline,
      'notifications-outline': notificationsOutline
    });
  }

  ngOnInit() {
    this.cargarDatos();
    this.cargarInfoUsuario();
  }

  // Método para cargar información del usuario para el header
  cargarInfoUsuario() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      // Cargar la imagen del perfil usando el modelo PerfilImagenDTO
      this.usuarioService.obtenerImagenPerfil(currentUser.id).subscribe({
        next: (perfilImagen) => {
          this.perfilImagen = perfilImagen;

          // Asegurar que la URL sea completa para evitar problemas de rutas relativas
          // Verifica si ya es una URL completa o necesita el prefijo de la API
          if (perfilImagen && perfilImagen.imagenUrl) {
            if (perfilImagen.imagenUrl.startsWith('http')) {
              this.fotoUsuario = perfilImagen.imagenUrl;
            } else {
              // Asume que la URL es relativa a la API
              this.fotoUsuario = `${environment.apiUrl}${perfilImagen.imagenUrl}`;
            }
          } else {
            this.fotoUsuario = 'assets/avatar.png';
          }

          console.log('URL de imagen cargada:', this.fotoUsuario);
        },
        error: (error) => {
          console.error('Error al cargar la imagen de perfil:', error);
          this.fotoUsuario = 'assets/avatar.png';
        }
      });

      // Cargar notificaciones
      this.cargarNotificaciones();
    }
  }

  // Método para cargar notificaciones (simulado)
  cargarNotificaciones() {
    // Aquí implementarías la lógica para obtener notificaciones reales
    // Por ahora simularemos algunas notificaciones
    setTimeout(() => {
      this.cantidadNotificaciones = Math.floor(Math.random() * 5);
      this.tieneNotificacionesPendientes = this.cantidadNotificaciones > 0;
    }, 1500);
  }

  cargarDatos() {
    this.isLoading = true;

    // Obtener el usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      this.isLoading = false;
      return;
    }

// Reemplaza la línea problemática por esto en tu método cargarDatos()
    if (currentUser?.id) {
      this.usuarioService.obtenerUsuarioPorId(currentUser.id).subscribe({
        next: (usuario) => {
          this.userName = usuario.nombre || 'Usuario';
        },
        error: () => {
          this.userName = 'Usuario';
        }
      });
    }

    // Cargar los grupos del usuario
    this.grupoService.listarGrupos(currentUser.id).subscribe({
      next: (grupos) => {
        this.grupos = grupos.map(grupo => ({
          ...grupo,
          descripcion: grupo.descripcion || ''
        }));

        // Si hay grupos, cargamos los gastos recientes del primer grupo
        if (grupos.length > 0) {
          this.gastoService.listarGastosPorGrupo(grupos[0].id!).subscribe({
            next: (gastos) => {
              this.ultimosGastos = gastos.slice(0, 5).map(gasto => ({
                ...gasto,
                tipoGasto: this.convertirTipoGasto(gasto.tipoGasto),
                metodoPago: this.convertirMetodoPago(gasto.metodoPago),
                metodoReparticion: this.convertirMetodoReparticion(gasto.metodoReparticion),
                divisa: this.convertirDivisa(gasto.divisa)
              }));

              // Finalizar carga
              this.isLoading = false;
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
    this.cargarNotificaciones();
    this.cargarInfoUsuario();
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

  nuevoGrupo() {
    const esPrimerGrupo = this.grupos.length === 0;

    this.router.navigate(['/grupos/nuevo'], {
      queryParams: {
        primerGrupo: esPrimerGrupo
      }
    });
  }

  verGrupo(id: number) {
    this.router.navigate(['/grupos', id]);
  }

  verInformes() {
    this.router.navigate(['/informes']);
  }

  verPerfil() {
    this.router.navigate(['/perfil']);
  }

  private convertirTipoGasto(tipo: any): TipoGasto {
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

  private convertirMetodoPago(metodo: any): MetodoPago {
    if (typeof metodo === 'string') {
      switch (metodo.toUpperCase()) {
        case 'EFECTIVO': return MetodoPago.EFECTIVO;
        case 'TARJETA': return MetodoPago.TARJETA;
        case 'TRANSFERENCIA': return MetodoPago.TRANSFERENCIA;
        case 'BIZUM': return MetodoPago.BIZUM;
        default: return MetodoPago.EFECTIVO;
      }
    }
    return metodo;
  }

  private convertirMetodoReparticion(metodo: any): MetodoReparticion {
    if (typeof metodo === 'string') {
      switch (metodo.toUpperCase()) {
        case 'PARTES_IGUALES': return MetodoReparticion.PARTES_IGUALES;
        case 'PORCENTAJE': return MetodoReparticion.PORCENTAJE;
        case 'EXACTO': return MetodoReparticion.EXACTO;
        default: return MetodoReparticion.PARTES_IGUALES;
      }
    }
    return metodo;
  }

  private convertirDivisa(divisa: any): Divisa {
    if (typeof divisa === 'string') {
      return divisa as unknown as Divisa;
    }
    return divisa;
  }
}
