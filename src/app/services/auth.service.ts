import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
import { LoginDTO } from '../models/login.model';
import { UsuarioId } from '../models/UsuarioId.model';
import { RecuperarPassword } from '../models/RecuperarPassword.model';
import { VerificarCodigo } from '../models/VerificarCodigo.model';
import { CambiarPassword } from '../models/CambiarPassword.model';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = `http://localhost:8080/auth`;

  constructor(private http: HttpClient) {}

  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  login(loginDTO: LoginDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, loginDTO)
      .pipe(
        tap(response => {
          const usuario = response.data; // Ajusta según la respuesta real
          if (usuario && usuario.id) {
            localStorage.setItem('currentUserId', usuario.id.toString());
            this.currentUserSubject.next({ id: usuario.id } as UsuarioId);
          } else {
            localStorage.removeItem('currentUserId');
            this.currentUserSubject.next(null);
          }
          // Guardar token si existe
          if (response.token) localStorage.setItem('token', response.token);
          if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
        }),
        catchError(error => {
          console.error('Error en login:', error);
          return throwError(() => error);
        })
      );
  }

// Cambia también el método para obtener el usuario:
  private getUserFromStorage(): Usuario | null {
    const idStr = localStorage.getItem('currentUserId');
    if (idStr) {
      return { id: Number(idStr) } as Usuario;
    }
    return null;
  }
  registro(usuarioDTO: any): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/registro`, usuarioDTO)
      .pipe(
        catchError(error => {
          console.error('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Métodos para recuperación de contraseña

  // Método para solicitar recuperación
  solicitarRecuperacion(email: string): Observable<any> {
    const recuperar: RecuperarPassword = { email };
    return this.http.post<any>(`${this.apiUrl}/recuperacion/solicitar`, recuperar)
      .pipe(
        catchError(error => {
          console.error('Error al solicitar recuperación:', error);
          return throwError(() => error);
        })
      );
  }

// Método para verificar código
  verificarCodigo(email: string, codigo: string): Observable<any> {
    const verificar: VerificarCodigo = { email, codigo };
    return this.http.post<any>(`${this.apiUrl}/recuperacion/verificar`, verificar)
      .pipe(
        catchError(error => {
          console.error('Error al verificar código:', error);
          return throwError(() => error);
        })
      );
  }

// Método para cambiar contraseña
  cambiarPassword(email: string, codigo: string, password: string): Observable<any> {
    const cambiar: CambiarPassword = {
      email,
      codigo,
      nuevaContrasenia: password // Nombre correcto según el DTO de Java
    };

    return this.http.post<any>(`${this.apiUrl}/recuperacion/cambiar-password`, cambiar)
      .pipe(
        catchError(error => {
          console.error('Error al cambiar contraseña:', error);
          return throwError(() => error);
        })
      );
  }


}
