export enum TipoGasto {
  NORMAL = 'NORMAL',
  RECURRENTE = 'RECURRENTE'
}

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA'
}

export enum MetodoReparticion {
  EQUITATIVO = 'EQUITATIVO',
  PORCENTAJE = 'PORCENTAJE',
  EXACTO = 'EXACTO'
}

export interface Gasto {
  id: number;
  idGrupo: number;
  descripcion: string;
  montoTotal: number;
  fecha: Date;
  idPagador: number;
  categoriaId?: number;
  categoriaNombre?: string;
  tipoGasto: TipoGasto;
  metodoPago: MetodoPago;
  metodoReparticion: MetodoReparticion;
  divisa?: string;
}
