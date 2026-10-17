
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UbicacionModel } from '../models/ubicacion-model';

@Injectable({ providedIn: 'root' })
export class UbicacionService {

    private readonly API_URL = 'http://localhost:8080/api/ubicaciones';

    ubicaciones: UbicacionModel[] = [];
    ubicacion!: UbicacionModel;

    constructor(private http: HttpClient) {}

    // READ: obtener todas las ubicaciones
    getAll(): Observable<UbicacionModel[]> {
        return this.http.get<UbicacionModel[]>(this.API_URL);
    }

    // READ: obtener una ubicación por UUID
    getByUuid(uuid: string): Observable<UbicacionModel> {
    return this.http.get<UbicacionModel>(
        `${this.API_URL}/${uuid}`
        );
    }

    // CREATE: crear una ubicación
    store(ubicacion: Partial<UbicacionModel>): Observable<UbicacionModel> {
        return this.http.post<UbicacionModel>(
        this.API_URL,
        ubicacion
        );
    }

    // UPDATE: actualizar una ubicación
    update(uuid: string,ubicacion: Partial<UbicacionModel>): Observable<UbicacionModel> {
    return this.http.put<UbicacionModel>(
        `${this.API_URL}/${uuid}`,
        ubicacion
        );
    }

    // DELETE: eliminar una ubicación
    delete(uuid: string): Observable<void> {
        return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
