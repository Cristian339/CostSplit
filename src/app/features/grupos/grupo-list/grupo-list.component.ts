// grupo-list.component.ts
import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { GrupoService } from '../../../services/grupo.service';
import { AuthService } from '../../../services/auth.service';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component';

interface GrupoSimple {
  id: number;
  nombre: string;
  descripcion: string;
}

@Component({
  selector: 'app-grupo-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    LoadingComponent,
    ErrorMessageComponent
  ],
  templateUrl: './grupo-list.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GrupoListComponent implements OnInit {
  grupos: any[] = []; // Usar any[] para evitar conflictos de tipos
  isLoading = false;
  errorMessage = '';

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
    this.errorMessage = '';
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
        this.errorMessage = 'Error al cargar grupos';
        this.mostrarToast('Error al cargar grupos', 'danger');
      }
    });
  }

  doRefresh(event: any) {
    this.cargarGrupos();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
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
