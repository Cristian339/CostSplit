import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));

// Añadimos soporte para PWA
if ('serviceWorker' in navigator && environment.production) {
  navigator.serviceWorker.register('/ngsw-worker.js')
    .then(registration => {
      console.log('Service Worker registrado con éxito:', registration);
    })
    .catch(error => {
      console.error('Error al registrar Service Worker:', error);
    });
}
