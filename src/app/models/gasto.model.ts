import { TipoGasto, MetodoPago, MetodoReparticion, Divisa } from './enums';

export interface DetalleGastoDTO {
  id?: number;
  gastoId?: number;
  usuarioId: number;
  usuarioNombre?: string;
  importe: number;
}

export interface GastoDTO {
  id?: number;
  idGrupo: number;
  descripcion: string;
  montoTotal: number;
  fecha: string | Date;
  idPagador: number;
  tipoGasto: TipoGasto;
  metodoPago: MetodoPago;
  metodoReparticion: MetodoReparticion;
  categoriaId?: number;
  categoriaNombre?: string;
  divisa: Divisa;
}
