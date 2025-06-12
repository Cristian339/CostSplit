import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UsuarioDTO {
  id?: number;
  nombre: string;
  apellidos?: string;
  email: string;
  telefono?: string;
  // Otros campos necesarios
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  obtenerUsuarioPorId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  crearUsuario(usuarioDTO: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.apiUrl, usuarioDTO)
      .pipe(catchError(this.handleError));
  }

  actualizarUsuario(id: number, usuarioDTO: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.apiUrl}/${id}`, usuarioDTO)
      .pipe(catchError(this.handleError));
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  listarAmigos(idUsuario: number): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}/${idUsuario}/amigos`)
      .pipe(catchError(this.handleError));
  }

  crearAmigo(idUsuario: number, idAmigo: number): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.apiUrl}/${idUsuario}/amigos/${idAmigo}`, {})
      .pipe(catchError(this.handleError));
  }

  eliminarAmigo(idUsuario: number, idAmigo: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idUsuario}/amigos/${idAmigo}`)
      .pipe(catchError(this.handleError));
  }

  buscarUsuarios(termino: string): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}/buscar?termino=${termino}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en UsuarioService:', error);
    return throwError(() => new Error(`Error en la operación: ${error.message}`));
  }
}
