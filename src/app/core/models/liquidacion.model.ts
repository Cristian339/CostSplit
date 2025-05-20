export enum EstadoLiquidacion {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  RECHAZADO = 'RECHAZADO'
}

export interface Liquidacion {
  id?: number;
  pagadorId: number;
  pagadorNombre: string;
  receptorId: number;
  receptorNombre: string;
  importe: number;
  fecha: Date;
  grupoId: number;
  grupoNombre: string;
  estado: EstadoLiquidacion;
}
