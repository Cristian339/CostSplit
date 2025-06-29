import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UsuarioDTO } from '../models/usuario.model';
import { PerfilImagenDTO } from '../models/perfil-imagen.model';

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

  actualizarUsuario(id: number, usuarioDTO: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.apiUrl}/${id}`, usuarioDTO)
      .pipe(catchError(this.handleError));
  }

  listarAmigos(idUsuario: number): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}/${idUsuario}/amigos`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Obtiene la imagen de perfil de un usuario
   */
  obtenerImagenPerfil(usuarioId: number): Observable<PerfilImagenDTO> {
    return this.http.get<PerfilImagenDTO>(`${this.apiUrl}/${usuarioId}/imagen`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza la imagen de perfil de un usuario
   */
  actualizarImagenPerfil(usuarioId: number, archivo: File): Observable<PerfilImagenDTO> {
    const formData = new FormData();
    formData.append('file', archivo);

    return this.http.post<PerfilImagenDTO>(`${this.apiUrl}/${usuarioId}/imagen`, formData)
      .pipe(catchError(this.handleError));
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
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
  private handleError(error: HttpErrorResponse) {
    console.error('Error en UsuarioService:', error);
    return throwError(() => new Error(`Error en la operación: ${error.message}`));
  }

  getUsuarioActualId(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/me/id`)
      .pipe(catchError(this.handleError));
  }

  buscarUsuarios(termino: string, idUsuarioActual: number) {
    // Cambia la URL para que coincida con la del backend
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}/buscar`, {
      params: { termino, idUsuarioActual }
    }).pipe(
      catchError(this.handleError)
    );
  }


}
