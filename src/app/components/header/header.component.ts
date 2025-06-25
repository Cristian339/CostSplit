import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HeaderComponent implements OnInit {
  @Input() tieneNotificaciones: boolean = false;
  @Input() numeroNotificaciones: number = 0;
  @Input() fotoUsuario: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
    // Inicializar componente
  }

  verPerfil() {
    this.router.navigate(['/perfil']);
  }

  verNotificaciones() {
    this.router.navigate(['/notificaciones']);
  }
}
