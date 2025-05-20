export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  urlImg?: string;
}

export interface UsuarioLogin {
  email: string;
  contrasenia: string;
}

export interface UsuarioRegistro {
  nombre: string;
  apellido: string;
  email: string;
  contrasenia: string;
  urlImg?: string;
}
