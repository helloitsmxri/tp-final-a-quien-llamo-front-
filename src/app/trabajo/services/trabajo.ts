import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrabajoModel } from '../models/trabajo-model';
import { TrabajoRequestModel } from '../models/trabajo-request-model';
import { EstadoTrabajo } from '../enum/estado-trabajo';

@Injectable({ providedIn: 'root' })
export class TrabajoService {

    private http = inject(HttpClient);

    private readonly API_URL = 'http://localhost:8080/aquienllamo/trabajos';

    // READ: obtener todos los trabajos
    getAll(): Observable<TrabajoModel[]> {
        return this.http.get<TrabajoModel[]>(this.API_URL);
    }

    // READ: obtener mis trabajos
    getMyJobs(): Observable<TrabajoModel[]> {
        return this.http.get<TrabajoModel[]>(`${this.API_URL}/mis-trabajos`);
    }

    // READ: obtener un trabajo por UUID
    getByUuid(uuid: string): Observable<TrabajoModel> {
        return this.http.get<TrabajoModel>(`${this.API_URL}/${uuid}`);
    }

    // READ: obtener trabajos por estado
    getJobsByEstado(estado: EstadoTrabajo): Observable<TrabajoModel[]> {
        return this.http.get<TrabajoModel[]>(`${this.API_URL}/listarTrabajos/${estado}`);
    }

    // READ: obtener trabajos por cliente
    getJobsByCliente(uuid: string): Observable<TrabajoModel[]> {
        return this.http.get<TrabajoModel[]>(`${this.API_URL}/cliente/${uuid}`);
    }

    // READ: obtener trabajos por técnico
    getJobsByTecnico(uuid: string): Observable<TrabajoModel[]> {
        return this.http.get<TrabajoModel[]>(`${this.API_URL}/tecnico/${uuid}`);
    }

    // CREATE: crear un trabajo
    storeTrabajo(trabajo: TrabajoRequestModel): Observable<TrabajoModel> {
        return this.http.post<TrabajoModel>(this.API_URL,trabajo);
    }

    // UPDATE: cambiar estado de un trabajo
    changeEstado(uuid: string,estado: EstadoTrabajo
    ): Observable<TrabajoModel> {
        return this.http.patch<TrabajoModel>(`${this.API_URL}/${uuid}/estado`,null,{params: { estadoTrabajo: estado }}
        );
    }
}