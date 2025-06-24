import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { LoginDTO } from '../../../models/login.model'; // Importando el modelo
import {
  IonIcon,
  IonInput,
  IonCheckbox,
  IonButton,
  IonLabel,
  IonSpinner,
  IonContent
} from '@ionic/angular/standalone';
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logInOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonIcon,
    IonInput,
    IonCheckbox,
    IonButton,
    IonLabel,
    IonSpinner,
    IonContent
  ]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    addIcons({
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'log-in-outline': logInOutline
    });
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Comprobar si hay credenciales guardadas
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({
        email: savedEmail,
        rememberMe: true
      });
    }
  }

  get email() {
    return this.loginForm.get('email');
    console.log(this.email)
  }

  get password() {
    return this.loginForm.get('password');
    console.log(this.password)
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  mostrarRecuperacion() {
    this.router.navigate(['/forgot-password']);
  }

  async login() {
    if (this.loginForm.invalid) {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;

    // Guardar email si rememberMe está activado
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'circular',
    });
    await loading.present();

    // Crear objeto LoginDTO con los campos correctos para el backend
    const loginDTO: LoginDTO = {
      email: email,
      contrasenia: password // Cambiado para coincidir con el backend
    };

    this.authService.login(loginDTO).subscribe({
      next: () => {
        loading.dismiss();
        this.isLoading = false;
        this.router.navigateByUrl('/home');
      },
      error: (error) => {
        loading.dismiss();
        this.isLoading = false;

        // Extraer mensaje específico del error
        const errorMessage = error.error?.token || 'Error al iniciar sesión. Verifica tus credenciales e intenta de nuevo.';
        this.showError(errorMessage);
        console.error('Error de login:', error);
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
