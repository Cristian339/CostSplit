import { EstadoLiquidacion } from './enums';

export interface LiquidacionDTO {
  id?: number;
  pagadorId: number;
  pagadorNombre?: string;
  receptorId: number;
  receptorNombre?: string;
  importe: number;
  fecha?: string | Date;
  grupoId: number;
  grupoNombre?: string;
  estado: EstadoLiquidacion;
}
