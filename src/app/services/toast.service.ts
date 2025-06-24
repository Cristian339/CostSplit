import { Injectable } from '@angular/core';
import { ToastButton, ToastController } from '@ionic/angular';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'middle' | 'bottom';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  /**
   * Presenta un toast con opciones básicas (compatible con el método original)
   */
  async presentToast(
    message: string,
    type: ToastType = 'success',
    duration: number = 3000,
    position: ToastPosition = 'bottom'
  ) {
    const toast = await this.createToast(message, {
      type,
      duration,
      position,
      showEmoji: true
    });

    await toast.present();
    return toast;
  }

  /**
   * Muestra un toast de éxito
   */
  async success(message: string, duration?: number, position?: ToastPosition) {
    return this.presentToast(message, 'success', duration, position);
  }

  /**
   * Muestra un toast de error
   */
  async error(message: string, duration?: number, position?: ToastPosition) {
    return this.presentToast(message, 'error', duration, position);
  }

  /**
   * Muestra un toast de advertencia
   */
  async warning(message: string, duration?: number, position?: ToastPosition) {
    return this.presentToast(message, 'warning', duration, position);
  }

  /**
   * Muestra un toast informativo
   */
  async info(message: string, duration?: number, position?: ToastPosition) {
    return this.presentToast(message, 'info', duration, position);
  }

  /**
   * Muestra un toast persistente que requiere acción del usuario para cerrarse
   */
  async presentPersistentToast(message: string, type: ToastType = 'info', position?: ToastPosition) {
    const toast = await this.createToast(message, {
      type,
      duration: 0,
      position: position || 'bottom',
      showEmoji: true,
      showCloseButton: true
    });

    await toast.present();
    return toast;
  }

  /**
   * Crea un toast con opciones personalizadas
   */
  private async createToast(message: string, options: {
    type: ToastType;
    duration?: number;
    position?: ToastPosition;
    showEmoji?: boolean;
    showCloseButton?: boolean;
  }) {
    const colors = {
      success: 'success',
      error: 'danger',
      warning: 'warning',
      info: 'first' // Usando el color primario de la paleta
    };

    const emojis = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const displayMessage = options.showEmoji
      ? `${emojis[options.type]} ${message}`
      : message;

    // Corregido: Especificando el tipo adecuado para los botones
    const buttons: ToastButton[] = options.showCloseButton
      ? [{ icon: 'close', role: 'cancel', side: 'end' as const }]
      : [];

    return this.toastController.create({
      message: displayMessage,
      duration: options.duration ?? 3000,
      position: options.position || 'bottom',
      color: colors[options.type],
      cssClass: `toast-${options.type}`,
      buttons,
      animated: true
    });
  }
}
