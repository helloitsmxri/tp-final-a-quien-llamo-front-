
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DenunciaModel } from '../models/denuncia-model';

@Injectable({ providedIn: 'root' })
export class DenunciaService {

    private readonly API_URL = 'http://localhost:8080/api/denuncias';

    denuncias: DenunciaModel[] = [];
    denuncia!: DenunciaModel;

    constructor(private http: HttpClient) {}

  // READ: obtener todas las denuncias
    getAll(): Observable<DenunciaModel[]> {
        return this.http.get<DenunciaModel[]>(this.API_URL);
    }

  // READ: obtener una denuncia por UUID
    getByUuid(uuid: string): Observable<DenunciaModel> {
        return this.http.get<DenunciaModel>(
        `${this.API_URL}/${uuid}`
        );
    }

  // CREATE: crear una denuncia
    store(denuncia: Partial<DenunciaModel>): Observable<DenunciaModel> {
        return this.http.post<DenunciaModel>(
        this.API_URL,
        denuncia
        );
    }

  // UPDATE: actualizar una denuncia
    update(uuid: string,denuncia: Partial<DenunciaModel>): Observable<DenunciaModel> {
        return this.http.put<DenunciaModel>(
        `${this.API_URL}/${uuid}`,
        denuncia
        );
    }

  // DELETE: eliminar una denuncia
    delete(uuid: string): Observable<void> {
        return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
