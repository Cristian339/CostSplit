export enum TipoGasto {
  COMIDA = 'COMIDA',
  TRANSPORTE = 'TRANSPORTE',
  ALOJAMIENTO = 'ALOJAMIENTO',
  OCIO = 'OCIO',
  OTROS = 'OTROS'
}

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TARJETA = 'TARJETA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  BIZUM = 'BIZUM'
}

export enum MetodoReparticion {
  PARTES_IGUALES = 'PARTES_IGUALES',
  PORCENTAJE = 'PORCENTAJE',
  EXACTO = 'EXACTO'
}

export enum Divisa {
  EUR = 'EUR',
  USD = 'USD',
  GBP = 'GBP',
  JPY = 'JPY',
  MXN = 'MXN'
}

export enum EstadoLiquidacion {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADA = 'CONFIRMADA',
  RECHAZADA = 'RECHAZADA'
}
