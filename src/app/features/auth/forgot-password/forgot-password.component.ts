import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import {
  IonIcon,
  IonInput,
  IonButton,
  IonSpinner,
  IonContent,
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  keyOutline,
  arrowBackOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule, RouterModule]
})
export class ForgotPasswordComponent implements OnInit {
  recoveryForm!: FormGroup; // Añadido ! para indicar inicialización en ngOnInit
  currentStep: number = 1;
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private authService: AuthService
  ) {
    addIcons({
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-outline': eyeOutline,
      'eye-off-outline': eyeOffOutline,
      'key-outline': keyOutline,
      'arrow-back-outline': arrowBackOutline
    });
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.recoveryForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      verificationCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  // Validador personalizado para comprobar que las contraseñas coinciden
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  get email() { return this.recoveryForm.get('email'); }
  get verificationCode() { return this.recoveryForm.get('verificationCode'); }
  get newPassword() { return this.recoveryForm.get('newPassword'); }
  get confirmPassword() { return this.recoveryForm.get('confirmPassword'); }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  async solicitarCodigo() {
    if (this.email?.invalid) return;

    const emailValue = this.email?.value;
    if (!emailValue) return;

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Enviando código...',
      spinner: 'circular'
    });
    await loading.present();

    this.authService.solicitarRecuperacion(emailValue).subscribe({
      next: (response) => {
        this.currentStep = 2;
        this.presentToast('Código de verificación enviado a tu correo');
      },
      error: (error) => {
        this.presentToast(error.error?.token || 'Error al enviar el código de verificación', 'danger');
        console.error(error);
      },
      complete: () => {
        loading.dismiss();
        this.isLoading = false;
      }
    });
  }

  async verificarCodigo() {
    if (this.verificationCode?.invalid || this.email?.invalid) return;

    const emailValue = this.email?.value;
    const codeValue = this.verificationCode?.value;
    if (!emailValue || !codeValue) return;

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Verificando código...',
      spinner: 'circular'
    });
    await loading.present();

    this.authService.verificarCodigo(emailValue, codeValue).subscribe({
      next: (response) => {
        this.currentStep = 3;
        this.presentToast('Código verificado correctamente');
      },
      error: (error) => {
        this.presentToast(error.error?.token || 'Código de verificación incorrecto', 'danger');
        console.error(error);
      },
      complete: () => {
        loading.dismiss();
        this.isLoading = false;
      }
    });
  }

  async cambiarContrasenia() {
    if (this.newPassword?.invalid || this.confirmPassword?.invalid || this.email?.invalid || this.verificationCode?.invalid) return;

    const emailValue = this.email?.value;
    const codeValue = this.verificationCode?.value;
    const passwordValue = this.newPassword?.value;

    if (!emailValue || !codeValue || !passwordValue) return;

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Actualizando contraseña...',
      spinner: 'circular'
    });
    await loading.present();

    // Mostrar datos exactos que se envían (para depuración)
    console.log('Enviando datos:', {email: emailValue, codigo: codeValue, password: passwordValue});

    this.authService.cambiarPassword(
      emailValue,
      codeValue,
      passwordValue
    ).subscribe({
      next: (response) => {
        this.presentToast('Contraseña actualizada correctamente');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        // Mostrar el error completo para mejor diagnóstico
        console.log('Error detallado:', error);

        // Intentar mostrar un mensaje más específico del backend
        const mensajeError = error.error?.mensaje || error.error?.token ||
          (error.error ? JSON.stringify(error.error) : 'Error al actualizar la contraseña');

        this.presentToast(mensajeError, 'danger');
      },
      complete: () => {
        loading.dismiss();
        this.isLoading = false;
      }
    });
  }

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    toast.present();
  }
}
