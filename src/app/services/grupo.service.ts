import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GrupoDTO } from '../models/grupo.model';
import { ImageResponse } from '../models/image-response.model';

export interface GrupoDetalladoDTO extends GrupoDTO {
  participantes?: any[];
  // Campos adicionales del grupo detallado
}

export interface CrearGrupoDTO {
  nombre: string;
  descripcion?: string;
}

export interface AniadirParticipanteDTO {
  idsUsuarios: number[];
  // Otros campos si son necesarios
}


@Injectable({
  providedIn: 'root'
})
export class GrupoService {
  private apiUrl = '/api/grupos';

  constructor(private http: HttpClient) {}


  crearGrupo(crearGrupoDTO: CrearGrupoDTO, idUsuarioCreador: number): Observable<GrupoDTO> {
    return this.http.post<GrupoDTO>(`${this.apiUrl}?idUsuarioCreador=${idUsuarioCreador}`, crearGrupoDTO);
  }

  obtenerGrupo(idGrupo: number): Observable<GrupoDetalladoDTO> {
    return this.http.get<GrupoDetalladoDTO>(`${this.apiUrl}/${idGrupo}`);
  }

  listarGrupos(idUsuario: number): Observable<GrupoDTO[]> {
    return this.http.get<GrupoDTO[]>(`${this.apiUrl}?idUsuario=${idUsuario}`);
  }

  aniadirParticipantes(idGrupo: number, aniadirParticipanteDTO: AniadirParticipanteDTO): Observable<GrupoDetalladoDTO> {
    return this.http.post<GrupoDetalladoDTO>(`${this.apiUrl}/${idGrupo}/participantes`, aniadirParticipanteDTO);
  }

  verParticipantes(idGrupo: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${idGrupo}/participantes`);
  }

  eliminarParticipantes(idGrupo: number, aniadirParticipanteDTO: AniadirParticipanteDTO): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${idGrupo}/participantes`, { body: aniadirParticipanteDTO });
  }

  subirImagen(formData: FormData): Observable<ImageResponse> {
    return this.http.post<ImageResponse>(`${this.apiUrl}/upload`, formData);
  }
}
