
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensajeModel } from '../models/mensaje-model';

@Injectable({ providedIn: 'root' })
export class MensajeService {

    private readonly API_URL = 'http://localhost:8080/api/mensajes';

    mensajes: MensajeModel[] = [];
    mensaje!: MensajeModel;

    constructor(private http: HttpClient) {}

  // READ: obtener todos los mensajes
    getAll(): Observable<MensajeModel[]> {
        return this.http.get<MensajeModel[]>(this.API_URL);
    }


  // CREATE: crear un mensaje
 store(uuidChat: string, uuidSender: string, mensaje?: string, archivo?: File): Observable<MensajeModel> {
    const formData = new FormData();
    formData.append('uuidChat', uuidChat);
    formData.append('uuidSender', uuidSender);

    if (mensaje) {
      formData.append('mensaje', mensaje);
    }
    if (archivo) {
      formData.append('archivo', archivo);
    }

    return this.http.post<MensajeModel>(`${this.API_URL}/crear`, formData);
  }

    // UPDATE: actualizar un mensaje
   update(uuidMensaje: string, nuevoTexto: string): Observable<MensajeModel> {
    const formData = new FormData();
    formData.append('uuidMensaje', uuidMensaje);
    formData.append('mensaje', nuevoTexto);

    return this.http.patch<MensajeModel>(`${this.API_URL}/modificar`, formData);
  }

    // DELETE: eliminar un mensaje
    delete(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
