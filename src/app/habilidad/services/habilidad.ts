
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HabilidadModel } from '../models/habilidad-model';

@Injectable({ providedIn: 'root' })
export class HabilidadService {

    private readonly API_URL = 'http://localhost:8080/api/habilidades';

    habilidades: HabilidadModel[] = [];
    habilidad!: HabilidadModel;

    constructor(private http: HttpClient) {}

  // READ: obtener todas las habilidades
    getAll(): Observable<HabilidadModel[]> {
        return this.http.get<HabilidadModel[]>(this.API_URL);
    }

  // READ: obtener una habilidad por UUID
    getByUuid(uuid: string): Observable<HabilidadModel> {
        return this.http.get<HabilidadModel>(
        `${this.API_URL}/${uuid}`
        );
    }

    // CREATE: crear una habilidad
    store(habilidad: Partial<HabilidadModel>): Observable<HabilidadModel> {
        return this.http.post<HabilidadModel>(
        this.API_URL,
        habilidad
        );
    }

  // UPDATE: actualizar una habilidad
    update(uuid: string,habilidad: Partial<HabilidadModel>): Observable<HabilidadModel> {
    return this.http.put<HabilidadModel>(
        `${this.API_URL}/${uuid}`,
        habilidad
        );
    }

  // DELETE: eliminar una habilidad
    delete(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
    );
    }
}
