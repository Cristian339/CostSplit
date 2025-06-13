/**
 * Enumeración de divisas soportadas por la aplicación.
 */
export enum Divisa {
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  JPY = 'JPY',
  MXN = 'MXN'
}

/**
 * Enumeración de tipos de gasto.
 */
export enum TipoGasto {
  COMIDA = 'COMIDA',
  TRANSPORTE = 'TRANSPORTE',
  ALOJAMIENTO = 'ALOJAMIENTO',
  OCIO = 'OCIO',
  OTRO = 'OTROS'
}

/**
 * Enumeración de métodos de pago.
 */
export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  BIZUM = 'BIZUM',
  OTRO = 'OTRO'
}

/**
 * Enumeración de métodos de repartición de gastos.
 */
export enum MetodoReparticion {
  EQUITATIVO = 'PARTES_IGUALES',
  PORCENTUAL = 'PORCENTAJE',
  PERSONALIZADO = 'EXACTO'
}

/**
 * Enumeración de estados de liquidación.
 */
export enum EstadoLiquidacion {
  PENDIENTE = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
  RECHAZADA = 'RECHAZADA',
  CANCELADA = 'CANCELADA'
}
