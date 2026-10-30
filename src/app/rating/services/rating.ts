
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RatingModel } from '../models/rating-model';
import { RatingResponse } from '../models/rating-response';

@Injectable({ providedIn: 'root' })
export class RatingService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/aquienllamo/ratings";

    // obtener las reseñas recibidas
    getRatings(uuid : string){
        return this.http.get<RatingModel[]>(`${this.url}/recibidas/${uuid}`)
    }

    // obtener las reseñas enviadas
    getSentRatings(uuid : string){
        return this.http.get<RatingModel[]>(`${this.url}/remitidas/${uuid}}`)
    }

    // crear una reseña
    createRatings(rating : RatingModel){
        return this.http.post<RatingModel>(this.url, rating);
    }

    getRecibidas(uuid: string): Observable<RatingResponse[]> {
     return this.http.get<RatingResponse[]>(`${this.url}/recibidas/${uuid}`);
    }
}
