import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { UsuarioDTO } from 'src/app/models/usuario.model';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class HeaderComponent implements OnInit {
  fotoUsuarioValida: string = 'assets/avatar.png';
  tieneNotificaciones: boolean = false;
  numeroNotificaciones: number = 0;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.usuarioService.getUsuarioActualId().subscribe({
      next: (id) => {
        this.usuarioService.obtenerUsuarioPorId(id).subscribe({
          next: async (usuario: UsuarioDTO) => {
            const url = usuario.urlImg || '';
            const valida = await this.verificarImagen(url);
            this.fotoUsuarioValida = valida ? url : 'assets/avatar.png';
          },
          error: () => {
            this.fotoUsuarioValida = 'assets/avatar.png';
          }
        });
      },
      error: () => {
        this.fotoUsuarioValida = 'assets/avatar.png';
      }
    });
  }

  private verificarImagen(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (!url) return resolve(false);
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  verPerfil() {
    this.router.navigate(['/perfil']);
  }

  verNotificaciones() {
    this.router.navigate(['/notificaciones']);
  }
}
