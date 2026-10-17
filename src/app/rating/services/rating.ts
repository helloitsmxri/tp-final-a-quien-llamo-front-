
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RatingModel } from '../models/rating-model';

@Injectable({ providedIn: 'root' })
export class RatingService {

    private readonly API_URL = 'http://localhost:8080/api/ratings';

    ratings: RatingModel[] = [];
    rating!: RatingModel;

    constructor(private http: HttpClient) {}

    // READ: obtener todas las calificaciones
    getAll(): Observable<RatingModel[]> {
        return this.http.get<RatingModel[]>(this.API_URL);
    }

    // READ: obtener una calificación por UUID
    getByUuid(uuid: string): Observable<RatingModel> {
        return this.http.get<RatingModel>(
        `${this.API_URL}/${uuid}`
        );
    }

    // CREATE: crear una calificación
    store(rating: Partial<RatingModel>): Observable<RatingModel> {
        return this.http.post<RatingModel>(
        this.API_URL,
        rating
        );
    }

    // UPDATE: actualizar una calificación
    update(uuid: string,rating: Partial<RatingModel>): Observable<RatingModel> {
        return this.http.put<RatingModel>(
        `${this.API_URL}/${uuid}`,
        rating
        );
    }

    // DELETE: eliminar una calificación
    delete(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
