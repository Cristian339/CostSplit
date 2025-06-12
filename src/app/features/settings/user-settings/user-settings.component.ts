import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class UserSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  temas = ['claro', 'oscuro', 'sistema'];
  divisasPorDefecto = ['EUR', 'USD', 'GBP', 'JPY', 'MXN'];

  constructor(
    private fb: FormBuilder,
    private toastController: ToastController
  ) {
    this.settingsForm = this.fb.group({
      tema: ['claro'],
      divisaPredeterminada: ['EUR'],
      notificacionesActivas: [true],
      idioma: ['es']
    });
  }

  ngOnInit(): void {
    this.cargarConfiguracionUsuario();
  }

  cargarConfiguracionUsuario(): void {
    // Cargar desde localStorage o desde una API si se guardan en backend
    const userSettings = localStorage.getItem('userSettings');

    if (userSettings) {
      this.settingsForm.patchValue(JSON.parse(userSettings));
    }
  }

  guardarConfiguracion(): void {
    const settings = this.settingsForm.value;
    localStorage.setItem('userSettings', JSON.stringify(settings));

    // Aplicar tema
    document.documentElement.setAttribute('data-theme', settings.tema);

    this.mostrarMensaje('Configuración guardada correctamente');
  }

  async mostrarMensaje(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      color: 'success'
    });
    toast.present();
  }
}
