import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface Notificacion {
  id: number;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'danger';
  fecha: Date;
  leida: boolean;
  enlace?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private notificaciones: Notificacion[] = [];
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  
  constructor(private authService: AuthService) {
    // Simular carga inicial de notificaciones
    this.cargarNotificaciones();
    
    // En una implementación real, aquí podrías suscribirte a un servicio de WebSockets
    // para recibir notificaciones en tiempo real
  }
  
  private cargarNotificaciones(): void {
    // Simulamos algunas notificaciones para demostración
    const mockNotificaciones: Notificacion[] = [
      {
        id: 1,
        mensaje: 'Juan te ha añadido al grupo "Viaje a Roma"',
        tipo: 'info',
        fecha: new Date(Date.now() - 3600000), // 1 hora atrás
        leida: false,
        enlace: '/grupos/1'
      },
      {
        id: 2,
        mensaje: 'María ha registrado un nuevo gasto en "Piso compartido"',
        tipo: 'info',
        fecha: new Date(Date.now() - 86400000), // 1 día atrás
        leida: false,
        enlace: '/grupos/2/gastos'
      },
      {
        id: 3,
        mensaje: 'Carlos ha confirmado una liquidación',
        tipo: 'success',
        fecha: new Date(Date.now() - 172800000), // 2 días atrás
        leida: true,
        enlace: '/grupos/2/liquidaciones'
      }
    ];
    
    this.notificaciones = mockNotificaciones;
    this.notificacionesSubject.next(this.notificaciones);
  }
  
  getNotificaciones(): Observable<Notificacion[]> {
    return this.notificacionesSubject.asObservable();
  }
  
  getNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }
  
  marcarComoLeida(id: number): void {
    const index = this.notificaciones.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notificaciones[index].leida = true;
      this.notificacionesSubject.next([...this.notificaciones]);
    }
  }
  
  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach(n => n.leida = true);
    this.notificacionesSubject.next([...this.notificaciones]);
  }
  
  agregarNotificacion(notificacion: Omit<Notificacion, 'id' | 'fecha' | 'leida'>): void {
    const nuevaNotificacion: Notificacion = {
      ...notificacion,
      id: this.generarId(),
      fecha: new Date(),
      leida: false
    };
    
    this.notificaciones.unshift(nuevaNotificacion);
    this.notificacionesSubject.next([...this.notificaciones]);
  }
  
  private generarId(): number {
    return Math.max(0, ...this.notificaciones.map(n => n.id)) + 1;
  }
}
