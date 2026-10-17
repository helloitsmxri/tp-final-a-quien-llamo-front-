
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CaracteristicaModel } from '../models/caracteristica-model';


@Injectable({providedIn: 'root'})
export class CaracteristicaService {

    private readonly API_URL = 'http://localhost:8080/api/caracteristicas';
    
        caracteristicas: CaracteristicaModel[];
        caracteristica !: CaracteristicaModel;

        constructor(private http : HttpClient){
        this.caracteristicas = []
    };

    getAll(): Observable<CaracteristicaModel[]> {
        return this.http.get<CaracteristicaModel[]>(this.API_URL);
    }


    getByUuid(uuid: string): Observable<CaracteristicaModel> {
        return this.http.get<CaracteristicaModel>(
            `${this.API_URL}/${uuid}`
        );
    }

  // CREATE: crear una característica
    store(caracteristica: Partial<CaracteristicaModel>): Observable<CaracteristicaModel> {
        return this.http.post<CaracteristicaModel>(this.API_URL,caracteristica);
    }

  // UPDATE: actualizar una característica
    update(uuid: string,caracteristica: Partial<CaracteristicaModel>): Observable<CaracteristicaModel> {
        return this.http.put<CaracteristicaModel>(
            `${this.API_URL}/${uuid}`,
            caracteristica);
    }

  // DELETE: eliminar una característica
    delete(uuid: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/${uuid}`);
    }
}
