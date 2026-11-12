import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensajeModel } from '../models/mensaje-model';

@Injectable({ providedIn: 'root' })
export class MensajeService {
  private readonly API_URL = 'http://localhost:8080/aquienllamo/mensajes';

  constructor(private http: HttpClient) {}

  // Mensajes de un chat
  getByChat(uuidChat: string): Observable<MensajeModel[]> {
    return this.http.get<MensajeModel[]>(`${this.API_URL}/chat/${uuidChat}`);
  }

  // Crear un mensaje. El emisor lo determina el backend con el token.
  store(uuidChat: string, mensaje?: string, archivo?: File): Observable<MensajeModel> {
    const formData = new FormData();
    formData.append('uuidChat', uuidChat);
    if (mensaje) formData.append('mensaje', mensaje);
    if (archivo) formData.append('archivo', archivo);
    return this.http.post<MensajeModel>(`${this.API_URL}/crear`, formData);
  }

  update(uuidMensaje: string, nuevoTexto: string): Observable<MensajeModel> {
    const formData = new FormData();
    formData.append('uuidMensaje', uuidMensaje);
    formData.append('mensaje', nuevoTexto);
    return this.http.patch<MensajeModel>(`${this.API_URL}/modificar`, formData);
  }
}