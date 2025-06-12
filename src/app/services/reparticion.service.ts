import { Injectable } from '@angular/core';
import { DetalleGastoDTO } from '../models/gasto.model';
import { UsuarioDTO } from '../models/usuario.model';
import { MetodoReparticion } from '../models/enums';

@Injectable({
  providedIn: 'root'
})
export class ReparticionService {
  
  constructor() {}
  
  /**
   * Calcula la repartición de un gasto entre usuarios según el método seleccionado
   */
  calcularReparticion(
    montoTotal: number, 
    participantes: UsuarioDTO[], 
    metodo: MetodoReparticion, 
    idPagador: number,
    porcentajes?: Record<number, number>, // Para método PORCENTAJE
    montosPorUsuario?: Record<number, number> // Para método EXACTO
  ): DetalleGastoDTO[] {
    switch (metodo) {
      case MetodoReparticion.PARTES_IGUALES:
        return this.repartirPartesIguales(montoTotal, participantes, idPagador);
      case MetodoReparticion.PORCENTAJE:
        return this.repartirPorPorcentaje(montoTotal, participantes, idPagador, porcentajes || {});
      case MetodoReparticion.EXACTO:
        return this.repartirMontoExacto(montoTotal, participantes, idPagador, montosPorUsuario || {});
      default:
        return this.repartirPartesIguales(montoTotal, participantes, idPagador);
    }
  }
  
  /**
   * Reparte un gasto en partes iguales entre todos los participantes
   */
  private repartirPartesIguales(
    montoTotal: number, 
    participantes: UsuarioDTO[],
    idPagador: number
  ): DetalleGastoDTO[] {
    const numParticipantes = participantes.length;
    
    if (numParticipantes === 0) {
      return [];
    }
    
    const montoPorParticipante = montoTotal / numParticipantes;
    
    return participantes.map(participante => ({
      usuarioId: participante.id!,
      usuarioNombre: `${participante.nombre} ${participante.apellido}`,
      importe: montoPorParticipante
    }));
  }
  
  /**
   * Reparte un gasto según porcentajes asignados a cada usuario
   */
  private repartirPorPorcentaje(
    montoTotal: number, 
    participantes: UsuarioDTO[],
    idPagador: number, 
    porcentajes: Record<number, number>
  ): DetalleGastoDTO[] {
    // Validar que la suma de porcentajes sea 100
    const sumaTotal = Object.values(porcentajes).reduce((sum, value) => sum + value, 0);
    
    if (Math.abs(sumaTotal - 100) > 0.01) {
      throw new Error('La suma de porcentajes debe ser 100%');
    }
    
    return participantes.map(participante => {
      const porcentaje = porcentajes[participante.id!] || 0;
      return {
        usuarioId: participante.id!,
        usuarioNombre: `${participante.nombre} ${participante.apellido}`,
        importe: (montoTotal * porcentaje) / 100
      };
    });
  }
  
  /**
   * Reparte un gasto según montos exactos asignados a cada usuario
   */
  private repartirMontoExacto(
    montoTotal: number, 
    participantes: UsuarioDTO[],
    idPagador: number, 
    montosPorUsuario: Record<number, number>
  ): DetalleGastoDTO[] {
    // Validar que la suma de montos sea igual al total
    const sumaMontos = Object.values(montosPorUsuario).reduce((sum, value) => sum + value, 0);
    
    if (Math.abs(sumaMontos - montoTotal) > 0.01) {
      throw new Error('La suma de los montos debe ser igual al total');
    }
    
    return participantes.map(participante => ({
      usuarioId: participante.id!,
      usuarioNombre: `${participante.nombre} ${participante.apellido}`,
      importe: montosPorUsuario[participante.id!] || 0
    }));
  }
}
