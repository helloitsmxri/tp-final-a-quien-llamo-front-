
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioModel } from '../models/portfolio-model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {

    private readonly API_URL = 'http://localhost:8080/api/portfolios';

    portfolios: PortfolioModel[] = [];
    portfolio!: PortfolioModel;

    constructor(private http: HttpClient) {}

    // READ: obtener todos los portfolios
    getAll(): Observable<PortfolioModel[]> {
        return this.http.get<PortfolioModel[]>(this.API_URL);
    }

    // READ: obtener un portfolio por UUID
    getByUuid(uuid: string): Observable<PortfolioModel> {
    return this.http.get<PortfolioModel>(
        `${this.API_URL}/${uuid}`
        );
    }

    // CREATE: crear un portfolio
    store(portfolio: Partial<PortfolioModel>): Observable<PortfolioModel> {
    return this.http.post<PortfolioModel>(
        this.API_URL,
        portfolio
        );
    }

    // UPDATE: actualizar un portfolio
    update(uuid: string,portfolio: Partial<PortfolioModel>): Observable<PortfolioModel> {
    return this.http.put<PortfolioModel>(
        `${this.API_URL}/${uuid}`,
        portfolio
        );
    }

    // DELETE: eliminar un portfolio
    delete(uuid: string): Observable<void> {
    return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
