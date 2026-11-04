import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';
import { archivoABase64 } from '../../utils/validadores';
import { PortfolioDatos } from '../models/portfolio-datos';
import { PortfolioUsuarioModel } from '../models/portfolio-usuario';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/aquienllamo/portafolios/usuario';

  // GET /tecnico/{uuid}: los portfolios que cargó el técnico
  getByTecnico(uuidTecnico: string): Observable<PortfolioUsuarioModel[]> {
    return this.http.get<PortfolioUsuarioModel[]>(`${this.url}/tecnico/${uuidTecnico}`);
  }

  crear(uuidTecnico: string, datos: PortfolioDatos): Observable<unknown> {
    return from(this.armarPayload(datos)).pipe(
      switchMap((payload) => this.http.post(`${this.url}/${uuidTecnico}`, payload))
    );
  }

  private async armarPayload(d: PortfolioDatos) {
    return {
      uuidEspecialidad: d.uuidEspecialidad,
      notasAspirante: d.notasAspirante,
      enlaceExterno: d.enlaceExterno,
      tipoArchivo: d.archivo?.type || 'enlace', // el back exige tipoArchivo no vacío
      archivoAdjunto: d.archivo ? await archivoABase64(d.archivo) : null,
    };
  }
}