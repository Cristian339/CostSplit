import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Primero verificar si hay un token almacenado
  const token = localStorage.getItem('token');

  // Si la ruta es login y hay un token, redirigir a home
  if (state.url.includes('/login') && token) {
    router.navigateByUrl('/home');
    return false;
  }

  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      // Si hay un usuario autenticado o un token válido, permitir acceso
      if (user || token) {
        return true;
      }

      // Si estamos intentando acceder a una ruta protegida sin autenticación
      if (!state.url.includes('/login')) {
        // Guardar la URL a la que intentaba acceder
        const returnUrl = state.url;

        // Redirigir al login con la URL de retorno como parámetro
        router.navigate(['/login'], {
          queryParams: { returnUrl }
        });
      }

      return !state.url.includes('/login'); // true si ya estamos en login, false si no
    }),
    catchError(() => {
      router.navigateByUrl('/login');
      return of(false);
    })
  );
};
