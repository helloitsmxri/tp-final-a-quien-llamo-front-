
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EspecialidadModel } from '../models/especialidad-model';

@Injectable({ providedIn: 'root' })
export class EspecialidadService {

    private readonly url = 'http://localhost:8080/aquienllamo/especialidades';

    especialidades: EspecialidadModel[] = [];
    especialidad!: EspecialidadModel;

    constructor(private http: HttpClient) {}

    // READ: obtener todas las especialidades
    getAll(): Observable<EspecialidadModel[]> {
        return this.http.get<EspecialidadModel[]>(`${this.url}/listar`);
    }

    // READ: obtener una especialidad por UUID
    getByUuid(uuid: string): Observable<EspecialidadModel> {
        return this.http.get<EspecialidadModel>(
        `${this.url}/${uuid}`
        );
    }

    // CREATE: crear una especialidad
    store(especialidad: Partial<EspecialidadModel>): Observable<EspecialidadModel> {
    return this.http.post<EspecialidadModel>(
        `${this.url}/crear`,
        especialidad
        );
    }

    // UPDATE: actualizar una especialidad
    update(uuid: string,especialidad: Partial<EspecialidadModel>): Observable<EspecialidadModel> {
        return this.http.put<EspecialidadModel>(
        `${this.url}/${uuid}`,
        especialidad
    );
    }

    // DELETE: eliminar una especialidad
    delete(uuid: string): Observable<void> {
        return this.http.delete<void>(
        `${this.url}/${uuid}`
        );
    }
}
