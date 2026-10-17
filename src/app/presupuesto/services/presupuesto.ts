
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PresupuestoModel } from '../models/presupuesto-model';

@Injectable({ providedIn: 'root' })
export class PresupuestoService {

    private readonly API_URL = 'http://localhost:8080/api/presupuestos';

    presupuestos: PresupuestoModel[] = [];
    presupuesto!: PresupuestoModel;

    constructor(private http: HttpClient) {}

  // READ: obtener todos los presupuestos
    getAll(): Observable<PresupuestoModel[]> {
        return this.http.get<PresupuestoModel[]>(this.API_URL);
    }

    // READ: obtener un presupuesto por UUID
    getByUuid(uuid: string): Observable<PresupuestoModel> {
        return this.http.get<PresupuestoModel>(
        `${this.API_URL}/${uuid}`
        );
    }

    // CREATE: crear un presupuesto
    store(presupuesto: Partial<PresupuestoModel>): Observable<PresupuestoModel> {
        return this.http.post<PresupuestoModel>(
        this.API_URL,
        presupuesto
        );
    }

    // UPDATE: actualizar un presupuesto
    update(uuid: string,presupuesto: Partial<PresupuestoModel>): Observable<PresupuestoModel> {
        return this.http.put<PresupuestoModel>(
        `${this.API_URL}/${uuid}`,
        presupuesto
        );
    }

    // DELETE: eliminar un presupuesto
    delete(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
