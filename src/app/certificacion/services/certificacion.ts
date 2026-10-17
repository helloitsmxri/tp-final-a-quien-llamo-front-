
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertificacionModel } from '../models/certificacion-model';

@Injectable({ providedIn: 'root' })
export class CertificacionService {

    private readonly API_URL = 'http://localhost:8080/api/certificaciones';

    certificaciones: CertificacionModel[] = [];
    certificacion!: CertificacionModel;

    constructor(private http: HttpClient) {}

  // READ: obtener todas las certificaciones
    getAll(): Observable<CertificacionModel[]> {
        return this.http.get<CertificacionModel[]>(this.API_URL);
    }

  // READ: obtener una certificación por UUID
    getByUuid(uuid: string): Observable<CertificacionModel> {
        return this.http.get<CertificacionModel>(
        `${this.API_URL}/${uuid}`
        );
    }

  // CREATE: crear una certificación
    store(certificacion: Partial<CertificacionModel>): Observable<CertificacionModel> {
    return this.http.post<CertificacionModel>(
        this.API_URL,
        certificacion
        );
    }

  // UPDATE: actualizar una certificación
    update(uuid: string,certificacion: Partial<CertificacionModel>): Observable<CertificacionModel> {
    return this.http.put<CertificacionModel>(
        `${this.API_URL}/${uuid}`,
        certificacion
        );
    }

  // DELETE: eliminar una certificación
    delete(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
