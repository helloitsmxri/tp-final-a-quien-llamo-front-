
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RubroModel } from '../models/rubro-model';

@Injectable({ providedIn: 'root' })
export class RubroService {
    private http = inject(HttpClient);
    private url = "http://localhost:8080/aquienllamo";

    getRubros(){
        return this.http.get<RubroModel[]>(`${this.url}/rubros`);
    }
}
