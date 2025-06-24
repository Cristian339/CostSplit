import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { LoadingController, ToastController, NavController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { LoginDTO } from '../../../models/login.model';
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
import { finalize, tap } from 'rxjs/operators';

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
  returnUrl: string = '/home';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private navCtrl: NavController
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

    // Obtener la URL de retorno de los query params
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/home';
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
  }

  get password() {
    return this.loginForm.get('password');
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  mostrarRecuperacion() {
    this.router.navigate(['/forgot-password']);
  }

  async login() {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;

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

    const loginDTO: LoginDTO = {
      email: email,
      contrasenia: password
    };

    // Mejorar manejo del flujo de autenticación
    this.authService.login(loginDTO).pipe(
      tap(response => {
        console.log('Login exitoso, respuesta:', response);
      }),
      finalize(() => {
        loading.dismiss();
        this.isLoading = false;
      })
    ).subscribe({
      next: () => {
        this.showSuccess('¡Inicio de sesión exitoso!');

        // Esperar un momento para asegurar que el token/estado de autenticación se establezca
        setTimeout(() => {
          console.log('Estado de autenticación actualizado, intentando navegar...');
          // Forzar actualización de la ruta usando window.location para evitar problemas con guards
          window.location.href = this.returnUrl;
        }, 1000);
      },
      error: (error) => {
        const errorMessage = error.error?.token || 'Error al iniciar sesión. Verifica tus credenciales e intenta de nuevo.';
        this.showError(errorMessage);
        console.error('Error de login:', error);
      }
    });
  }

  private async showSuccess(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color: 'success',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
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
