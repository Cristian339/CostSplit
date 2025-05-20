import { Usuario } from './usuario.model';

export interface Grupo {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaCreacion: Date;
  usuarioCreadorId: number;
  divisa?: string;
}

export interface GrupoDetallado extends Grupo {
  participantes: Usuario[];
}

export interface CrearGrupo {
  nombre: string;
  descripcion?: string;
  divisa?: string;
  participantesIds?: number[];
}
