import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { NotificacionService, Notificacion } from '../../services/notificacion.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterLink],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent implements OnInit {
  notificaciones: Notificacion[] = [];
  
  constructor(private notificacionService: NotificacionService) {}
  
  ngOnInit() {
    this.notificacionService.getNotificaciones().subscribe(
      notificaciones => this.notificaciones = notificaciones
    );
  }
  
  marcarComoLeida(id: number, event: Event) {
    event.stopPropagation();
    this.notificacionService.marcarComoLeida(id);
  }
  
  marcarTodasComoLeidas() {
    this.notificacionService.marcarTodasComoLeidas();
  }
  
  getIcono(tipo: string): string {
    switch(tipo) {
      case 'success': return 'checkmark-circle-outline';
      case 'warning': return 'warning-outline';
      case 'danger': return 'alert-circle-outline';
      case 'info': 
      default: return 'information-circle-outline';
    }
  }
  
  getColor(tipo: string): string {
    return tipo;
  }
}
