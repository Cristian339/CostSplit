import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LiquidacionDTO {
  id?: number;
  grupoId: number;
  usuarioOrigenId: number;
  usuarioDestinoId: number;
  monto: number;
  estado?: string;
  fecha?: Date | string;
  // Otros campos necesarios
}

@Injectable({
  providedIn: 'root'
})
export class LiquidacionService {
  private apiUrl = '/api/liquidaciones';

  constructor(private http: HttpClient) {}

  crearLiquidacion(liquidacionDTO: LiquidacionDTO): Observable<LiquidacionDTO> {
    return this.http.post<LiquidacionDTO>(this.apiUrl, liquidacionDTO);
  }

  obtenerLiquidacionesPorGrupo(idGrupo: number): Observable<LiquidacionDTO[]> {
    return this.http.get<LiquidacionDTO[]>(`${this.apiUrl}?idGrupo=${idGrupo}`);
  }

  actualizarEstadoLiquidacion(idLiquidacion: number, nuevoEstado: string): Observable<LiquidacionDTO> {
    return this.http.patch<LiquidacionDTO>(`${this.apiUrl}/${idLiquidacion}/estado?nuevoEstado=${nuevoEstado}`, {});
  }
}
