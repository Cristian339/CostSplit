import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private apiUrl = '/api/usuarios';

  constructor(private http: HttpClient) {}

  obtenerUsuarios(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.apiUrl);
  }

  crearUsuario(usuarioDTO: UsuarioDTO): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.apiUrl, usuarioDTO);
  }

  listarAmigos(idUsuario: number): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}/${idUsuario}/amigos`);
  }

  crearAmigo(idUsuario: number, idAmigo: number): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(`${this.apiUrl}/${idUsuario}/amigos/${idAmigo}`, {});
  }
}
