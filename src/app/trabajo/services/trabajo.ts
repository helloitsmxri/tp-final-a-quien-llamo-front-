
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrabajoModel } from '../models/trabajo-model';

@Injectable({ providedIn: 'root' })
export class TrabajoService {

    private readonly API_URL = 'http://localhost:8080/api/trabajos';
    private readonly API_URL_FORM_TRABAJO = 'http://localhost:8080/aquienllamo/trabajos';

    trabajos: TrabajoModel[] = [];
    trabajo!: TrabajoModel;

    constructor(private http: HttpClient) {}

    // READ: obtener todos los trabajos
    getAll(): Observable<TrabajoModel[]> {
        return this.http.get<TrabajoModel[]>(this.API_URL);
    }

    // READ: obtener un trabajo por UUID
    getByUuid(uuid: string|null): Observable<TrabajoModel> {
    return this.http.get<TrabajoModel>(`${this.API_URL}/${uuid}`);
    }

    // CREATE: crear un trabajo
    store(trabajo: Partial<TrabajoModel>): Observable<TrabajoModel> {
        return this.http.post<TrabajoModel>(
        this.API_URL_FORM_TRABAJO,
        trabajo
        );
    }

    // UPDATE: actualizar un trabajo
    update(uuid: string,trabajo: Partial<TrabajoModel>): Observable<TrabajoModel> {
    return this.http.put<TrabajoModel>(
        `${this.API_URL}/${uuid}`,
        trabajo
        );
    }

    // DELETE: eliminar un trabajo
    delete(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
