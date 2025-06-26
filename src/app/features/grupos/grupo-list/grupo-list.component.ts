import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GrupoService } from '../../../services/grupo.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { UsuarioService } from '../../../services/usuario.service'; // Asegúrate de que la ruta es correcta
import { addIcons } from 'ionicons';
import {
  peopleOutline,addCircleOutline,peopleCircleOutline
} from 'ionicons/icons';
@Component({
  selector: 'app-grupo-list',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './grupo-list.component.html',
  styleUrls: ['./grupo-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GrupoListComponent implements OnInit {
  grupos: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private grupoService: GrupoService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router,
    private toastService: ToastService
  ) {
    addIcons({
      'people-outline': peopleOutline,
      'add-circle-outline': peopleOutline,
      'people-circle-outline': peopleCircleOutline
    });
  }

  ngOnInit() {

    this.cargarGrupos();
  }

  cargarGrupos() {
    this.isLoading = true;
    this.errorMessage = '';

    this.usuarioService.getUsuarioActualId().subscribe({
      next: (userId) => {
        this.grupoService.listarGrupos(userId).subscribe({
          next: (grupos) => {
            this.grupos = Array.isArray(grupos) ? grupos.map((g: any) => ({
              id: g.id,
              nombre: g.nombre,
              descripcion: g.descripcion || '',
              fechaCreacion: g.fechaCreacion
            })) : [];
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error al cargar grupos:', error);
            this.grupos = [];
            this.isLoading = false;
            this.errorMessage = 'Error al cargar grupos';
            this.toastService.error('Error al cargar grupos');
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener userId:', error);
        this.isLoading = false;
        this.errorMessage = 'No se pudo obtener el usuario actual';
        this.toastService.error('No se pudo obtener el usuario actual');
        this.router.navigate(['/home']);
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
}
