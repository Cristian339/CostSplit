/**
 * Interfaz para representar un usuario básico
 */
export interface Usuario {
  id?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  urlImg?: string;
}

/**
 * Interfaz para transferencia de datos de usuario
 * con propiedades requeridas para el backend
 */
export interface UsuarioDTO {
  id?: number;
  nombre: string;
  apellido: string;
  email: string;
  urlImg?: string;
}

/**
 * Interfaz para las credenciales de inicio de sesión
 */
export interface CredencialesDTO {
  email: string;
  password: string;
}

/**
 * Interfaz para el cambio de contraseña
 */
export interface CambioPasswordDTO {
  passwordActual: string;
  passwordNuevo: string;
  confirmarPassword: string;
}
