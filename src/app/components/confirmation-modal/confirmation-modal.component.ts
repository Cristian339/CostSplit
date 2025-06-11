import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ header }}</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="dismiss(false)">
            <ion-icon name="close-outline" slot="icon-only"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <p>{{ message }}</p>

      <div class="ion-text-center ion-margin-top">
        <ion-button color="medium" (click)="dismiss(false)">
          {{ cancelText }}
        </ion-button>
        <ion-button [color]="confirmColor" (click)="dismiss(true)">
          {{ confirmText }}
        </ion-button>
      </div>
    </ion-content>
  `
})
export class ConfirmationModalComponent {
  @Input() header: string = 'Confirmar';
  @Input() message: string = '¿Estás seguro?';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() confirmColor: string = 'primary';

  constructor(private modalController: ModalController) {}

  dismiss(result: boolean) {
    this.modalController.dismiss(result);
  }
}
