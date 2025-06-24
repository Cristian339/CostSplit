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

  // Si hay un token, permitir acceso inmediatamente
  if (token) {
    // Si intentamos acceder al login pero ya tenemos token, redirigir a home
    if (state.url.includes('/login')) {
      router.navigateByUrl('/home');
      return false;
    }
    return true; // Permitir acceso a cualquier otra ruta si hay token
  }

  // Si no hay token y tratamos de acceder a cualquier ruta protegida
  if (!state.url.includes('/login')) {
    // Guardar la URL a la que intentaba acceder
    const returnUrl = state.url;

    // Redirigir al login con la URL de retorno como parámetro
    router.navigate(['/login'], {
      queryParams: { returnUrl }
    });
    return false;
  }

  // Permitir acceso a login si no hay token
  return true;
};
