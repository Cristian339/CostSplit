import { UsuarioDTO } from './usuario.model';

export interface AniadirParticipanteDTO {
  idUsuarios: number[];
}

export interface CrearGrupoDTO {
  nombre: string;
  imagenUrl?: string;
  descripcion: string;
  participantesIds?: number[];
}

export interface GrupoDTO {
  id?: number;
  nombre: string;
  imagenUrl?: string;
  fechaCreacion?: string | Date;
  descripcion: string;
}

export interface GrupoDetalladoDTO extends GrupoDTO {
  usuarios: UsuarioDTO[];
}
