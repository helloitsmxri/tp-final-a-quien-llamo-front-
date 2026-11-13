import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RatingModel } from '../models/rating-model';
import { RatingResponse } from '../models/rating-response';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/aquienllamo/ratings';

  // Obtener las reseñas recibidas por un usuario
  getRecibidas(uuid: string): Observable<RatingResponse[]> {
    return this.http.get<RatingResponse[]>(`${this.url}/recibidas/${uuid}`);
  }

  // Obtener las reseñas enviadas por un usuario
  getRemitidas(uuid: string): Observable<RatingResponse[]> {
    return this.http.get<RatingResponse[]>(`${this.url}/remitidas/${uuid}`);
  }

  // Crear una nueva reseña
  createRating(rating: RatingModel): Observable<RatingResponse> {
    return this.http.post<RatingResponse>(this.url, rating);
  }
}