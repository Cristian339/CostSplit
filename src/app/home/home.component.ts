import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GastoService } from '../services/gasto.service';
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

// Swiper para otros componentes
import { register } from 'swiper/element/bundle';
import {GrupoListComponent} from "../features/grupos/grupo-list/grupo-list.component";
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink, HeaderComponent, GrupoListComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit {
  ultimosGastos: any[] = [];
  isLoading = true;
  userName = '';

  tieneNotificacionesPendientes = false;
  cantidadNotificaciones = 0;
  fotoUsuario = '';
  perfilImagen: PerfilImagenDTO | null = null;

  constructor(
    private authService: AuthService,
    private gastoService: GastoService,
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
    this.cargarInfoUsuario();
    this.isLoading = false;
  }

  cargarInfoUsuario() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.usuarioService.obtenerUsuarioPorId(currentUser.id).subscribe({
        next: (usuario: any) => {
          this.userName = usuario.nombre || 'Usuario';
        },
        error: () => {
          this.userName = 'Usuario';
        }
      });

      this.usuarioService.obtenerImagenPerfil(currentUser.id).subscribe({
        next: (perfilImagen) => {
          this.perfilImagen = perfilImagen;
          if (perfilImagen && perfilImagen.imagenUrl) {
            if (perfilImagen.imagenUrl.startsWith('http')) {
              this.fotoUsuario = perfilImagen.imagenUrl;
            } else {
              this.fotoUsuario = `${environment.apiUrl}${perfilImagen.imagenUrl}`;
            }
          } else {
            this.fotoUsuario = 'assets/avatar.png';
          }
        },
        error: () => {
          this.fotoUsuario = 'assets/avatar.png';
        }
      });

      this.cargarNotificaciones();
    }
  }

  cargarNotificaciones() {
    setTimeout(() => {
      this.cantidadNotificaciones = Math.floor(Math.random() * 5);
      this.tieneNotificacionesPendientes = this.cantidadNotificaciones > 0;
    }, 1500);
  }

  doRefresh(event: any) {
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
    this.router.navigate(['/grupos/nuevo']);
  }

  verInformes() {
    this.router.navigate(['/informes']);
  }

  verPerfil() {
    this.router.navigate(['/perfil']);
  }
}
