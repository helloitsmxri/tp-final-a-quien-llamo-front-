
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RubroModel } from '../models/rubro-model';

@Injectable({ providedIn: 'root' })
export class RubroService {

    private readonly API_URL = 'http://localhost:8080/api/rubros';

    rubros: RubroModel[] = [];
    rubro!: RubroModel;

    constructor(private http: HttpClient) {}

    // READ: obtener todos los rubros
    getAll(): Observable<RubroModel[]> {
        return this.http.get<RubroModel[]>(this.API_URL);
    }

  // READ: obtener un rubro por UUID
    getByUuid(uuid: string): Observable<RubroModel> {
        return this.http.get<RubroModel>(
            `${this.API_URL}/${uuid}`
            );
    }

    // CREATE: crear un rubro
    store(rubro: Partial<RubroModel>): Observable<RubroModel> {
        return this.http.post<RubroModel>(
        this.API_URL,
        rubro
        );
    }

    // UPDATE: actualizar un rubro
    update(uuid: string,rubro: Partial<RubroModel>): Observable<RubroModel> {
        return this.http.put<RubroModel>(
        `${this.API_URL}/${uuid}`,
        rubro
        );
    }

    // DELETE: eliminar un rubro
    delete(uuid: string): Observable<void> {
        return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
