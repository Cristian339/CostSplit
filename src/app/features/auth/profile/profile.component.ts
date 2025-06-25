import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ToastService } from '../../../services/toast.service';
import { UsuarioDTO } from '../../../models/usuario.model';
import { PerfilImagenDTO } from '../../../models/perfil-imagen.model';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  usuario: UsuarioDTO | null = null;
  profileForm: FormGroup;
  isLoading = false;
  isEditing = false;
  isLoadingInitial = true;
  imagenSeleccionada: File | null = null;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private toastService: ToastService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      urlImg: ['']
    });
  }

  ngOnInit() {
    this.cargarUsuario();
  }

  cargarUsuario() {
    // Ahora obtenemos el id del usuario desde el backend
    this.usuarioService.getUsuarioActualId().subscribe({
      next: (userId) => {
        if (!userId) {
          this.toastService.error('No se pudo obtener el ID del usuario');
          this.isLoadingInitial = false;
          return;
        }

        this.usuarioService.obtenerUsuarioPorId(userId)
          .subscribe({
            next: (usuario) => {
              this.usuario = usuario;
              this.profileForm.patchValue({
                nombre: usuario.nombre || '',
                apellido: usuario.apellido || '',
                email: usuario.email || '',
                urlImg: usuario.urlImg || ''
              });
              this.profileForm.disable();
              this.isLoadingInitial = false;
            },
            error: (error) => {
              console.error('Error en cargarUsuario:', error);
              this.toastService.error('Error al cargar el perfil del usuario');
              this.isLoadingInitial = false;
            }
          });
      },
      error: (error) => {
        console.error('Error al obtener el ID del usuario:', error);
        this.toastService.error('No se pudo obtener la información del usuario');
        this.isLoadingInitial = false;
      }
    });
  }

  toggleEditing() {
    this.isEditing = !this.isEditing;

    if (this.isEditing) {
      this.profileForm.enable();
      // Mantener el email deshabilitado
      this.profileForm.get('email')?.disable();
    } else {
      this.profileForm.disable();
      // Revertir cambios si se cancela la edición
      if (this.usuario) {
        this.profileForm.patchValue({
          nombre: this.usuario.nombre || '',
          apellido: this.usuario.apellido || '',
          email: this.usuario.email || '',
          urlImg: this.usuario.urlImg || ''
        });
      }
      this.imagenSeleccionada = null;
    }
  }

  async guardarCambios() {
    if (this.profileForm.invalid) {
      this.toastService.error('Por favor, completa todos los campos correctamente.');
      return;
    }

    if (!this.usuario?.id) {
      this.toastService.error('Error: ID de usuario no disponible');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();
    this.isLoading = true;

    // Preparamos el objeto actualizado
    const usuarioActualizado: UsuarioDTO = {
      id: this.usuario.id,
      nombre: this.profileForm.value.nombre,
      apellido: this.profileForm.value.apellido,
      email: this.usuario.email,
      urlImg: this.profileForm.value.urlImg
    };

    // Actualizar usuario en el backend
    this.usuarioService.actualizarUsuario(this.usuario.id, usuarioActualizado)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          loading.dismiss();
        }),
        catchError(error => {
          console.error('Error al actualizar perfil:', error);
          this.toastService.error('No se pudieron guardar los cambios');
          return of(null);
        })
      )
      .subscribe(usuarioResponse => {
        if (usuarioResponse) {
          this.usuario = usuarioResponse;
          this.toggleEditing(); // Salir del modo edición
          this.toastService.success('Perfil actualizado correctamente');

          // Si hay una imagen seleccionada, la subimos
          if (this.imagenSeleccionada) {
            this.subirImagenPerfil();
          }
        }
      });
  }

  async subirImagenPerfil() {
    if (!this.imagenSeleccionada || !this.usuario?.id) return;

    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...',
      spinner: 'crescent'
    });
    await loading.present();

    this.usuarioService.actualizarImagenPerfil(this.usuario.id, this.imagenSeleccionada)
      .pipe(
        finalize(() => loading.dismiss()),
        catchError(error => {
          console.error('Error al subir imagen:', error);
          this.toastService.error('No se pudo subir la imagen');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          // Asumimos que PerfilImagenDTO tiene una propiedad urlImagen o similar
          const imageUrl = this.obtenerUrlImagen(response);

          if (imageUrl && this.usuario) {
            // Actualizamos la URL de la imagen en el usuario y en el formulario
            this.usuario.urlImg = imageUrl;
            this.profileForm.patchValue({ urlImg: imageUrl });

            this.toastService.success('Imagen actualizada correctamente');
          }
        }

        this.imagenSeleccionada = null;
      });
  }

  // Método correcto para obtener URL de imagen teniendo en cuenta la estructura real de PerfilImagenDTO
  private obtenerUrlImagen(perfilImagen: PerfilImagenDTO): string | undefined {
    if (perfilImagen && typeof perfilImagen === 'object') {
      return perfilImagen.imagenUrl || '';
    }
    return '';
  }

  seleccionarImagen() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validamos que sea una imagen
      if (!file.type.includes('image')) {
        this.toastService.error('Por favor, selecciona un archivo de imagen válido');
        return;
      }

      // Validamos el tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.toastService.error('La imagen es demasiado grande. Máximo 5MB');
        return;
      }

      this.imagenSeleccionada = file;

      // Actualizamos la vista previa
      const reader = new FileReader();
      reader.onload = () => {
        const avatar = document.querySelector('.profile-avatar img') as HTMLImageElement;
        if (avatar && reader.result) {
          avatar.src = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  async cambiarContrasena() {
    const alert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      cssClass: 'password-alert',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Contraseña actual',
          cssClass: 'password-input'
        },
        {
          name: 'newPassword',
          type: 'password',
          placeholder: 'Nueva contraseña'
        },
        {
          name: 'confirmNewPassword',
          type: 'password',
          placeholder: 'Confirmar nueva contraseña'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        },
        {
          text: 'Cambiar',
          cssClass: 'confirm-button',
          handler: async (data) => {
            if (!data.currentPassword || !data.newPassword || !data.confirmNewPassword) {
              this.toastService.error('Todos los campos son obligatorios');
              return false;
            }

            if (data.newPassword !== data.confirmNewPassword) {
              this.toastService.error('Las contraseñas nuevas no coinciden');
              return false;
            }

            // Aquí implementarías el servicio para cambiar la contraseña
            // Simulamos una llamada exitosa por ahora
            const loading = await this.loadingController.create({
              message: 'Cambiando contraseña...',
              spinner: 'crescent'
            });
            await loading.present();

            setTimeout(() => {
              loading.dismiss();
              this.toastService.success('Contraseña cambiada correctamente');
            }, 1500);

            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async cerrarSesion() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      cssClass: 'logout-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'cancel-button'
        },
        {
          text: 'Cerrar Sesión',
          cssClass: 'danger-button',
          handler: () => {
            const loading = this.loadingController.create({
              message: 'Cerrando sesión...',
              duration: 1000
            });
            loading.then(l => l.present());

            setTimeout(() => {
              this.authService.logout();
              this.router.navigate(['/auth/login']);
            }, 1000);
          }
        }
      ]
    });

    await alert.present();
  }
}
