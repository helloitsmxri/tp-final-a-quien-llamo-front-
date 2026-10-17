
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagoModel } from '../models/pago-model';

@Injectable({ providedIn: 'root' })
export class PagoService {

    private readonly API_URL = 'http://localhost:8080/api/pagos';

    pagos: PagoModel[] = [];
    pago!: PagoModel;

    constructor(private http: HttpClient) {}

    // READ: obtener todos los pagos
    getAll(): Observable<PagoModel[]> {
        return this.http.get<PagoModel[]>(this.API_URL);
    }

  // READ: obtener un pago por UUID
    getByUuid(uuid: string): Observable<PagoModel> {
    return this.http.get<PagoModel>(
        `${this.API_URL}/${uuid}`
        );
    }

    // CREATE: registrar un pago
    store(pago: Partial<PagoModel>): Observable<PagoModel> {
    return this.http.post<PagoModel>(
        this.API_URL,
        pago
        );
    }

    // UPDATE: actualizar un pago
    update(uuid: string,pago: Partial<PagoModel>): Observable<PagoModel> {
        return this.http.put<PagoModel>(
        `${this.API_URL}/${uuid}`,
        pago
        );
    }

    // DELETE: eliminar un pago
    delete(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
