import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GastoDTO {
  id?: number;
  idGrupo: number;
  descripcion: string;
  montoTotal: number;
  fecha: Date | string;
  idPagador: number;
  tipoGasto: string;
  metodoPago: string;
  metodoReparticion: string;
  divisa: string;
  // Otros campos necesarios
}

export interface DetalleGastoDTO {
  id?: number;
  gastoId?: number;
  usuarioId: number;
  monto: number;
  // Otros campos necesarios
}

@Injectable({
  providedIn: 'root'
})
export class GastoService {
  private apiUrl = '/api/gastos';

  constructor(private http: HttpClient) {}

  crearGasto(gastoDTO: GastoDTO): Observable<GastoDTO> {
    return this.http.post<GastoDTO>(this.apiUrl, gastoDTO);
  }

  listarGastosPorGrupo(idGrupo: number): Observable<GastoDTO[]> {
    return this.http.get<GastoDTO[]>(`${this.apiUrl}?idGrupo=${idGrupo}`);
  }

  obtenerGasto(idGasto: number): Observable<GastoDTO> {
    return this.http.get<GastoDTO>(`${this.apiUrl}/${idGasto}`);
  }

  aniadirDetalleGasto(idGasto: number, detalleGastoDTO: DetalleGastoDTO): Observable<DetalleGastoDTO> {
    return this.http.post<DetalleGastoDTO>(`${this.apiUrl}/${idGasto}/detalles`, detalleGastoDTO);
  }

  listarDetallesGasto(idGasto: number): Observable<DetalleGastoDTO[]> {
    return this.http.get<DetalleGastoDTO[]>(`${this.apiUrl}/${idGasto}/detalles`);
  }
}
