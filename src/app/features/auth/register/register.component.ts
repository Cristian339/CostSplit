import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import {
  IonIcon,
  IonInput,
  IonButton,
  IonLabel,
  IonSpinner,
  IonContent
} from '@ionic/angular/standalone';
import {
  personOutline,
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  createOutline,
  arrowBackOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonIcon,
    IonInput,
    IonButton,
    IonSpinner,
    IonContent
  ]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({
      'person-outline': personOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'create-outline': createOutline,
      'arrow-back-outline': arrowBackOutline
    });
  }

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  get name() {
    return this.registerForm.get('name');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShowConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  async register() {
    if (this.registerForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { name, lastName, email, password } = this.registerForm.value;

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Creando cuenta...',
      spinner: 'circular',
    });
    await loading.present();

    // Preparar objeto DTO para el servicio de registro con los nombres correctos
    const usuarioDTO = {
      nombre: name,
      apellido: lastName,
      email: email,
      contrasenia: password
    };

    this.authService.registro(usuarioDTO).subscribe({
      next: (response) => {
        loading.dismiss();
        this.isLoading = false;

        this.toastController.create({
          message: '¡Registro exitoso! Bienvenido a CostSplitBD',
          duration: 3000,
          position: 'top',
          color: 'success'
        }).then(toast => toast.present());

        // Después del registro exitoso, redirigir al login
        this.router.navigateByUrl('/login');
      },
      error: (error) => {
        loading.dismiss();
        this.isLoading = false;

        // Mostrar mensaje específico del error si está disponible
        const errorMsg = error.error?.message || 'Error al registrar cuenta. Por favor intenta nuevamente.';
        this.showError(errorMsg);
        console.error('Error de registro:', error);
      }
    });
  }

  private async showError(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'danger',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}
