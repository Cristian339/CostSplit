// grupo-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { GrupoService } from '../../services/grupo.service';
import { AuthService } from '../../services/auth.service';
import { GrupoDTO } from '../../models/grupo.model';

@Component({
  selector: 'app-grupo-list',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  templateUrl: './grupo-list.component.html'
})
export class GrupoListComponent implements OnInit {
  grupos: GrupoDTO[] = [];
  isLoading = false;

  constructor(
    private grupoService: GrupoService,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.cargarGrupos();
  }

  cargarGrupos() {
    this.isLoading = true;
    const userId = this.authService.getCurrentUser()?.id;

    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.grupoService.listarGrupos(userId).subscribe({
      next: (grupos) => {
        this.grupos = grupos;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando grupos:', error);
        this.isLoading = false;
        this.mostrarToast('Error al cargar grupos', 'danger');
      }
    });
  }

  verDetalleGrupo(grupoId: number) {
    this.router.navigate(['/grupos', grupoId]);
  }

  nuevoGrupo() {
    this.router.navigate(['/grupos/nuevo']);
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color
    });
    toast.present();
  }
}
