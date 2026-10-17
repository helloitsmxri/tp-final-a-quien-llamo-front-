
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

  // READ: obtener un mensaje por UUID
    getByUuid(uuid: string): Observable<MensajeModel> {
    return this.http.get<MensajeModel>(
        `${this.API_URL}/${uuid}`
        );
    }

  // CREATE: crear un mensaje
    store(mensaje: Partial<MensajeModel>): Observable<MensajeModel> {
    return this.http.post<MensajeModel>(
        this.API_URL,
        mensaje
        );
    }

    // UPDATE: actualizar un mensaje
    update(uuid: string,mensaje: Partial<MensajeModel>): Observable<MensajeModel> {
    return this.http.put<MensajeModel>(
        `${this.API_URL}/${uuid}`,
        mensaje
        );
    }

    // DELETE: eliminar un mensaje
    delete(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
