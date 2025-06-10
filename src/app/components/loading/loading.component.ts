import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <div class="loading-container">
      <ion-spinner name="crescent"></ion-spinner>
      <p *ngIf="message">{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      min-height: 150px;
    }

    ion-spinner {
      width: 48px;
      height: 48px;
    }

    p {
      margin-top: 1rem;
      color: var(--ion-color-medium);
      text-align: center;
    }
  `]
})
export class LoadingComponent {
  @Input() message: string = '';
}
