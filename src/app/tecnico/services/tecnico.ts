
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TecnicoModel } from '../models/tecnico-model';

@Injectable({ providedIn: 'root' })
export class TecnicoService {

    private readonly url = 'http://localhost:8080/api/tecnicos';

    tecnicos: TecnicoModel[] = [];
    tecnico!: TecnicoModel;

    constructor(private http: HttpClient) {}

    // READ: obtener todos los técnicos
    getTecnicos(): Observable<TecnicoModel[]> {
        return this.http.get<TecnicoModel[]>(this.url);
    }

    // READ: obtener un técnico por UUID
    getByUuid(uuid: string): Observable<TecnicoModel> {
        return this.http.get<TecnicoModel>(
        `${this.url}/${uuid}`
        );
    }

    // CREATE: crear un técnico
    guardarTecnico(tecnico: Partial<TecnicoModel>): Observable<TecnicoModel> {
    return this.http.post<TecnicoModel>(
        this.url,
        tecnico
        );
    }

    crearTecnico(formData: FormData): Observable<unknown> {
      return this.http.post<unknown>(`${this.url}/registrar-nuevo`, formData);
    }

    // UPDATE: actualizar un técnico
    modificarTecnico(uuid: string,tecnico: Partial<TecnicoModel>): Observable<TecnicoModel> {
        return this.http.put<TecnicoModel>(
        `${this.url}/${uuid}`,
        tecnico
        );
    }

    // DELETE: eliminar un técnico
    eliminarTecnico(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.url}/${uuid}`
        );
    }
}
