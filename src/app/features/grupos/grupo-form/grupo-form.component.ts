import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { GrupoService } from '../../../services/grupo.service';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { ImageService } from '../../../services/image.service';
import { LoadingComponent } from '../../../components/loading/loading.component';
import { ErrorMessageComponent } from '../../../components/error-message/error-message.component';
import { ToastService } from '../../../services/toast.service';
import { addIcons } from "ionicons";
import { ImageResponse } from '../../../models/image-response.model';
import {
  peopleOutline,
  personAddOutline
} from "ionicons/icons";


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

  // Propiedades para la subida de imágenes
  metodoImagen: string = 'url';
  selectedFile: File | null = null;
  previewImageUrl: string | ArrayBuffer | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private grupoService: GrupoService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private imageService: ImageService,
    private router: Router,
    private toastService: ToastService
  ) {
    addIcons({
      'person-add-outline': personAddOutline,
      'people-outline': peopleOutline,
    });
  }

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

    // Obtener el ID del usuario actual
    const currentUserId = this.authService.getCurrentUser()?.id;

    if (!currentUserId) {
      this.isLoading = false;
      return;
    }

    // Modificar para cargar solo amigos en lugar de todos los usuarios
    this.usuarioService.listarAmigos(currentUserId).subscribe({
      next: (amigos) => {
        this.usuarios = amigos || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar amigos', err);
        this.errorMessage = 'No se pudieron cargar tus amigos';
        this.isLoading = false;
        this.toastService.error('No se pudieron cargar tus amigos');
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

  // Método para cambiar entre métodos de imagen
  cambiarMetodoImagen() {
    if (this.metodoImagen === 'url') {
      this.selectedFile = null;
      this.previewImageUrl = null;
    } else {
      this.grupoForm.patchValue({
        imagenUrl: ''
      });
    }
  }

  // Método para manejar la selección de archivos
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl = e.target?.result || null;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.grupoForm.invalid) {
      this.marcarCamposTocados();
      return;
    }

    this.isLoading = true;

    // Intentar obtener el usuario actual
    let currentUser = this.authService.getCurrentUser();

    const continuarConCreacion = (userId: number) => {
      // Crear objeto de datos para el backend
      const grupoData = {
        nombre: this.grupoForm.value.nombre,
        descripcion: this.grupoForm.value.descripcion,
        imagenUrl: this.metodoImagen === 'url' ? this.grupoForm.value.imagenUrl : null,
        idsParticipantes: [...this.selectedParticipantes]
      };

      // Si es imagen local, primero subir la imagen
      if (this.metodoImagen === 'local' && this.selectedFile) {
        const formData = new FormData();
        formData.append('file', this.selectedFile);

        this.imageService.subirImagen(formData).subscribe({
          next: (response: ImageResponse) => {
            grupoData.imagenUrl = response.url;
            this.crearGrupo(userId, grupoData);
          },
          error: (err: any) => {
            console.error('Error al subir la imagen', err);
            this.isLoading = false;
            this.toastService.error(err.error?.mensaje || 'No se pudo subir la imagen');
          }
        });
      } else {
        this.crearGrupo(userId, grupoData);
      }
    };

    // Si el usuario está y tiene id, continuar
    if (currentUser && typeof currentUser.id === 'number') {
      continuarConCreacion(currentUser.id);
    } else {
      // Si no, obtener el usuario desde el backend
      // ...
      this.usuarioService.getUsuarioActualId().subscribe({
        next: (usuarioId) => {
          if (typeof usuarioId === 'number') {
            continuarConCreacion(usuarioId);
          } else {
            this.isLoading = false;
            this.toastService.error('No se pudo obtener el ID de usuario');
          }
        },
        error: () => {
          this.isLoading = false;
          this.toastService.error('No se pudo obtener el ID de usuario');
        }
      });
    }
  }

  crearGrupo(userId: number, grupoData: any) {
    this.grupoService.crearGrupo(grupoData, userId).subscribe({
      next: (grupo) => {
        console.log('Grupo creado exitosamente', grupo);
        this.isLoading = false;
        this.toastService.success('Grupo creado exitosamente');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Error al crear el grupo', err);
        this.isLoading = false;
        this.toastService.error(err.error?.mensaje || 'No se pudo crear el grupo. Por favor, inténtalo de nuevo.');
      }
    });
  }

  marcarCamposTocados() {
    Object.keys(this.grupoForm.controls).forEach(key => {
      this.grupoForm.get(key)?.markAsTouched();
    });
    this.toastService.warning('Por favor, completa todos los campos obligatorios');
  }

  cancelar() {
    // Asegurarse de navegar correctamente a grupos sin redirigir al login
    this.router.navigate(['/home'], {
      skipLocationChange: false,
      replaceUrl: true
    });
  }
}
