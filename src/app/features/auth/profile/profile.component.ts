import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioDTO } from '../../../models/usuario.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  usuario: UsuarioDTO | null = null;
  profileForm: FormGroup;
  isLoading = false;
  isEditing = false;

  constructor(
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private fb: FormBuilder,
    private toastController: ToastController,
    private alertController: AlertController
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
    this.usuario = this.authService.getCurrentUser();

    if (this.usuario) {
      this.profileForm.patchValue({
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        email: this.usuario.email,
        urlImg: this.usuario.urlImg || ''
      });

      // Deshabilitar campos al cargar
      this.profileForm.disable();
    }
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
      this.cargarUsuario();
    }
  }

  async guardarCambios() {
    if (this.profileForm.invalid) {
      const toast = await this.toastController.create({
        message: 'Por favor, completa todos los campos correctamente.',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
      return;
    }

    this.isLoading = true;

    const usuarioActualizado: UsuarioDTO = {
      ...this.usuario,
      nombre: this.profileForm.value.nombre,
      apellido: this.profileForm.value.apellido,
      urlImg: this.profileForm.value.urlImg
    };

    // Aquí se implementaría el servicio para actualizar el perfil
    // Por ahora, simularemos una actualización exitosa
    setTimeout(async () => {
      this.isLoading = false;
      this.isEditing = false;
      this.profileForm.disable();

      // En una implementación real, aquí actualizarías el usuario en el servicio de autenticación
      // Por ejemplo: this.authService.updateCurrentUser(usuarioActualizado);

      const toast = await this.toastController.create({
        message: 'Perfil actualizado correctamente',
        duration: 2000,
        color: 'success'
      });
      await toast.present();
    }, 1000);
  }

  async cambiarContraseña() {
    const alert = await this.alertController.create({
      header: 'Cambiar Contraseña',
      inputs: [
        {
          name: 'currentPassword',
          type: 'password',
          placeholder: 'Contraseña actual'
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
          role: 'cancel'
        },
        {
          text: 'Cambiar',
          handler: async (data) => {
            if (!data.currentPassword || !data.newPassword || !data.confirmNewPassword) {
              const toast = await this.toastController.create({
                message: 'Todos los campos son obligatorios',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
              return false;
            }

            if (data.newPassword !== data.confirmNewPassword) {
              const toast = await this.toastController.create({
                message: 'Las contraseñas nuevas no coinciden',
                duration: 2000,
                color: 'danger'
              });
              await toast.present();
              return false;
            }

            // Aquí implementarías el servicio para cambiar la contraseña
            // Por ahora, simularemos un cambio exitoso
            const toast = await this.toastController.create({
              message: 'Contraseña cambiada correctamente',
              duration: 2000,
              color: 'success'
            });
            await toast.present();
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
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          handler: () => {
            this.authService.logout();
          }
        }
      ]
    });

    await alert.present();
  }
}
