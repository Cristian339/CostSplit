import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImageResponse } from '../models/image-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = `${environment.apiUrl}/api/grupos`;

  constructor(private http: HttpClient) {}

  /**
   * Sube una imagen al servidor
   * @param file Archivo a subir (FormData con el archivo en el campo "file")
   * @returns Observable con la respuesta que contiene la URL de la imagen
   */
  subirImagen(formData: FormData): Observable<ImageResponse> {
    return this.http.post<ImageResponse>(`${this.apiUrl}/upload`, formData);
  }
}
