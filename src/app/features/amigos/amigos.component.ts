import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioDTO } from '../../models/usuario.model';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-amigos',
  templateUrl: './amigos.component.html',
  styleUrls: ['./amigos.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AmigosComponent implements OnInit {
  amigos: UsuarioDTO[] = [];
  usuariosSugeridos: UsuarioDTO[] = [];
  currentUserId: number = 0;
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private toastService: ToastService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.getCurrentUser();
  }

  private getCurrentUser() {
    // Obtenemos el usuario actual directamente del servicio
    const usuario = this.authService.getCurrentUser();

    if (usuario && usuario.id) {
      this.currentUserId = usuario.id;
      this.cargarAmigos();
    } else {
      this.toastService.error('Error al cargar información de usuario');
      console.error('Usuario no disponible o sin ID');
    }
  }

  async cargarAmigos() {
    this.isLoading = true;
    const loading = await this.presentLoading('Cargando tus amigos...');

    this.usuarioService.listarAmigos(this.currentUserId).subscribe({
      next: (amigos) => {
        this.amigos = amigos;
        this.isLoading = false;
        loading.dismiss();
      },
      error: (error: any) => {
        console.error('Error al cargar amigos:', error);
        this.toastService.error('Error al cargar amigos');
        this.isLoading = false;
        loading.dismiss();
      }
    });
  }

  async buscarUsuarios() {
    if (this.searchTerm.trim().length < 3) {
      this.usuariosSugeridos = [];
      return;
    }

    const loading = await this.presentLoading('Buscando usuarios...');

    this.usuarioService.buscarUsuarios(this.searchTerm).subscribe({
      next: (usuarios) => {
        // Filtrar usuarios que ya son amigos y el usuario actual
        this.usuariosSugeridos = usuarios.filter(u =>
          u.id !== this.currentUserId &&
          !this.amigos.some(amigo => amigo.id === u.id)
        );
        loading.dismiss();
      },
      error: (error: any) => {
        console.error('Error al buscar usuarios:', error);
        this.toastService.error('Error en la búsqueda');
        loading.dismiss();
      }
    });
  }

  async agregarAmigo(usuario: UsuarioDTO) {
    if (!usuario.id) {
      this.toastService.error('ID de usuario no válido');
      return;
    }

    const loading = await this.presentLoading('Agregando amigo...');

    this.usuarioService.crearAmigo(this.currentUserId, usuario.id).subscribe({
      next: () => {
        this.amigos.push(usuario);
        this.usuariosSugeridos = this.usuariosSugeridos.filter(u => u.id !== usuario.id);
        this.searchTerm = '';
        this.toastService.success('Amigo agregado correctamente');
        loading.dismiss();
      },
      error: (error: any) => {
        console.error('Error al agregar amigo:', error);
        this.toastService.error('No se pudo agregar como amigo');
        loading.dismiss();
      }
    });
  }

  async confirmarEliminarAmigo(amigo: UsuarioDTO) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Estás seguro de que quieres eliminar a ${amigo.nombre} de tus amigos?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.eliminarAmigo(amigo);
          }
        }
      ]
    });

    await alert.present();
  }

  async eliminarAmigo(amigo: UsuarioDTO) {
    if (!amigo.id) {
      this.toastService.error('ID de amigo no válido');
      return;
    }

    const loading = await this.presentLoading('Eliminando amigo...');

    this.usuarioService.eliminarAmigo(this.currentUserId, amigo.id).subscribe({
      next: () => {
        this.amigos = this.amigos.filter(a => a.id !== amigo.id);
        this.toastService.success('Amigo eliminado correctamente');
        loading.dismiss();
      },
      error: (error: any) => {
        console.error('Error al eliminar amigo:', error);
        this.toastService.error('No se pudo eliminar el amigo');
        loading.dismiss();
      }
    });
  }

  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message,
      spinner: 'circles'
    });
    await loading.present();
    return loading;
  }
}
