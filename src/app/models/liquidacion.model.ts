import { EstadoLiquidacion } from './enums';

export interface LiquidacionDTO {
  id?: number;
  grupoId: number;
  usuarioOrigenId: number;
  usuarioDestinoId: number;
  monto: number;
  estado?: EstadoLiquidacion;
  fecha: Date;

  // Propiedades adicionales que estás usando
  pagadorId: number;
  receptorId: number;
  importe: number;
}

