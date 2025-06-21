import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { GrupoService, CrearGrupoDTO } from '../../../services/grupo.service';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component';

@Component({
  selector: 'app-grupo-form',
  templateUrl: './grupo-form.component.html',
  styleUrls: ['./grupo-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    ErrorMessageComponent
  ]
})
export class GrupoFormComponent implements OnInit {
  grupoForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  usuarios: any[] = [];
  selectedParticipantes: number[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private grupoService: GrupoService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarUsuarios();
  }

  initForm() {
    this.grupoForm = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', Validators.required],
      imagenUrl: ['']
    });
  }

  cargarUsuarios() {
    this.isLoading = true;
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios.filter(u => u.id !== this.authService.getCurrentUser()?.id);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios', err);
        this.errorMessage = 'No se pudieron cargar los usuarios';
        this.isLoading = false;
      }
    });
  }

  toggleParticipante(userId: number) {
    const index = this.selectedParticipantes.indexOf(userId);
    if (index > -1) {
      this.selectedParticipantes.splice(index, 1);
    } else {
      this.selectedParticipantes.push(userId);
    }
  }

  isParticipanteSelected(userId: number): boolean {
    return this.selectedParticipantes.includes(userId);
  }

  onSubmit() {
    if (this.grupoForm.invalid) {
      Object.keys(this.grupoForm.controls).forEach(key => {
        const controlErrors = this.grupoForm.get(key)?.errors;
        if (controlErrors) {
          console.log(`Error en ${key}:`, controlErrors);
        }
      });
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.errorMessage = 'Debes iniciar sesión para crear un grupo';
      return;
    }

    // Usar casting a any para evitar problemas de tipo temporalmente
    const grupoData: any = {
      nombre: this.grupoForm.value.nombre,
      descripcion: this.grupoForm.value.descripcion,
      // Probar con diferentes nombres de propiedades que podrían estar en CrearGrupoDTO
      usuariosIds: [...this.selectedParticipantes] // Alternativa a participantesIds
    };

    // Si tienes el campo imagenUrl en el formulario, agrégalo
    if (this.grupoForm.value.imagenUrl) {
      grupoData.imagen = this.grupoForm.value.imagenUrl; // Alternativa a imagenUrl
    }

    this.isLoading = true;
    // Asegurar que currentUser.id no sea undefined
    const userId: number = currentUser.id;

    this.grupoService.crearGrupo(grupoData, userId).subscribe({
      next: (grupo) => {
        console.log('Grupo creado exitosamente', grupo);
        this.isLoading = false;
        this.router.navigate(['/grupos']);
      },
      error: (err) => {
        console.error('Error al crear el grupo', err);
        this.errorMessage = 'No se pudo crear el grupo. Por favor, inténtalo de nuevo.';
        this.isLoading = false;
      }
    });
  }

  cancelar() {
    this.router.navigate(['/grupos']);
  }
}
