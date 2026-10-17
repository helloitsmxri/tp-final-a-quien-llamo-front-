
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TecnicoModel } from '../models/tecnico-model';

@Injectable({ providedIn: 'root' })
export class TecnicoService {

    private readonly API_URL = 'http://localhost:8080/api/tecnicos';

    tecnicos: TecnicoModel[] = [];
    tecnico!: TecnicoModel;

    constructor(private http: HttpClient) {}

    // READ: obtener todos los técnicos
    getAll(): Observable<TecnicoModel[]> {
        return this.http.get<TecnicoModel[]>(this.API_URL);
    }

    // READ: obtener un técnico por UUID
    getByUuid(uuid: string): Observable<TecnicoModel> {
        return this.http.get<TecnicoModel>(
        `${this.API_URL}/${uuid}`
        );
    }

    // CREATE: crear un técnico
    store(tecnico: Partial<TecnicoModel>): Observable<TecnicoModel> {
    return this.http.post<TecnicoModel>(
        this.API_URL,
        tecnico
        );
    }

    // UPDATE: actualizar un técnico
    update(uuid: string,tecnico: Partial<TecnicoModel>): Observable<TecnicoModel> {
        return this.http.put<TecnicoModel>(
        `${this.API_URL}/${uuid}`,
        tecnico
        );
    }

    // DELETE: eliminar un técnico
    delete(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
