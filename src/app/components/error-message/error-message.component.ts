import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="error-container">
      <ion-icon name="alert-circle-outline" color="danger"></ion-icon>
      <h2>¡Ups! Algo salió mal</h2>
      <p>{{ message }}</p>
      <ion-button (click)="retryClicked()">Reintentar</ion-button>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 2rem;
    }

    ion-icon {
      font-size: 48px;
      color: var(--ion-color-danger);
    }

    h2 {
      margin: 1rem 0 0.5rem;
      color: var(--ion-color-dark);
    }

    p {
      margin: 0 0 1.5rem;
      color: var(--ion-color-medium);
    }
  `]
})
export class ErrorMessageComponent {
  @Input() message: string = 'Ha ocurrido un error.';
  @Output() retry = new EventEmitter<void>();

  retryClicked() {
    this.retry.emit();
  }
}
