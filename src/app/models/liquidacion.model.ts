import { EstadoLiquidacion } from './enums';

export interface LiquidacionDTO {
  id?: number;
  grupoId: number;
  pagadorId: number;
  receptorId: number;
  importe: number;
  fecha: Date;
  estado: EstadoLiquidacion;
  pagadorNombre?: string;
  receptorNombre?: string;
}
