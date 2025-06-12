import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { catchError, throwError } from 'rxjs';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const toastController = inject(ToastController);
  const router = inject(Router);
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '';
      
      if (error.error instanceof ErrorEvent) {
        // Error del lado del cliente
        errorMsg = `Error: ${error.error.message}`;
      } else {
        // Error del lado del servidor
        switch (error.status) {
          case 401:
            errorMsg = 'No autorizado. Por favor, inicie sesión nuevamente.';
            // Redirigir a login si la sesión ha expirado
            router.navigate(['/login']);
            break;
          case 403:
            errorMsg = 'No tiene permisos para acceder a este recurso.';
            break;
          case 404:
            errorMsg = 'Recurso no encontrado.';
            break;
          case 500:
            errorMsg = 'Error del servidor. Intente más tarde.';
            break;
          default:
            errorMsg = `Error: ${error.message}`;
        }
      }
      
      // Mostrar mensaje de error
      presentToast(toastController, errorMsg);
      
      return throwError(() => error);
    })
  );
};

async function presentToast(toastController: ToastController, message: string) {
  const toast = await toastController.create({
    message,
    duration: 3000,
    position: 'top',
    color: 'danger',
    buttons: [{
      text: 'Cerrar',
      role: 'cancel'
    }]
  });
  
  await toast.present();
}
