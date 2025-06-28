import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMsg = '';

      if (error.error instanceof ErrorEvent) {
        errorMsg = `Error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 401:
            errorMsg = 'No autorizado. Por favor, inicie sesión nuevamente.';
            toastService.error(errorMsg).then(() => {
              setTimeout(() => {
                router.navigateByUrl('/login', { replaceUrl: true });
              }, 100);
            });
            break;
          case 403:
            errorMsg = 'No tiene permisos para acceder a este recurso.';
            toastService.error(errorMsg);
            break;
          case 404:
            errorMsg = 'Recurso no encontrado.';
            toastService.error(errorMsg);
            break;
          case 500:
            errorMsg = 'Error del servidor. Intente más tarde.';
            toastService.error(errorMsg);
            break;
          default:
            errorMsg = `Error: ${error.message}`;
            toastService.error(errorMsg);
        }
      }

      return throwError(() => error);
    })
  );
};
