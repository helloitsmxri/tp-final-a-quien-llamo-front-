
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, from, switchMap } from 'rxjs';

import { archivoABase64 } from '../../utils/validadores';
import { PortfolioDatos } from '../models/portfolio-datos';
import { PortfolioUsuarioModel } from '../models/portfolio-usuario';
import { PortfolioEdicionDatos } from '../models/portfolio-edicion-datos';
import { PortfolioAdminModel } from '../models/portfolio-admin';
import { EstadoVerificacion } from '../enum/estado-verificacion';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private http = inject(HttpClient);

  private readonly url =
    'http://localhost:8080/aquienllamo/portafolios/usuario';

  // Obtener los portfolios de un técnico
  getByTecnico(uuidTecnico: string): Observable<PortfolioUsuarioModel[]> {
    return this.http.get<PortfolioUsuarioModel[]>(
      `${this.url}/tecnico/${uuidTecnico}`
    );
  }

  // Obtener un portfolio individual
  getByUuid(uuidPortfolio: string): Observable<PortfolioUsuarioModel> {
    return this.http.get<PortfolioUsuarioModel>(
      `${this.url}/${uuidPortfolio}`
    );
  }

  // Crear portfolio
  crear(uuidTecnico: string, datos: PortfolioDatos): Observable<unknown> {
    return from(this.armarPayload(datos)).pipe(
      switchMap((payload) =>
        this.http.post(`${this.url}/${uuidTecnico}`, payload)
      )
    );
  }

  private async armarPayload(d: PortfolioDatos) {
    return { titulo: d.titulo, uuidEspecialidad: d.uuidEspecialidad, notasAspirante: d.notasAspirante, enlaceExterno: d.enlaceExterno, tipoArchivo: d.archivo?.type || 'enlace',
      archivoAdjunto: d.archivo
        ? await archivoABase64(d.archivo)
        : null,
    };
  }

  // Actualizar portfolio
  actualizar( uuidTecnico: string, uuidPortfolio: string, datos: PortfolioEdicionDatos): Observable<unknown> {
    return from(this.armarPayloadActualizacion(datos)).pipe( switchMap((payload) =>
        this.http.put(
          `${this.url}/${uuidTecnico}/${uuidPortfolio}`,
          payload
        )
      )
    );
  }

  private async armarPayloadActualizacion(datos: PortfolioEdicionDatos) {
    return {
      titulo: datos.titulo,
      notasAspirante: datos.notasAspirante,
      enlaceExterno: datos.enlaceExterno,
      tipoArchivo: datos.archivo?.type ?? null,
      archivoAdjunto: datos.archivo
        ? await archivoABase64(datos.archivo)
        : null,
    };
  }

  private readonly urlAdmin =
  'http://localhost:8080/aquienllamo/portafolios/admin';

// Obtener todos los portfolios para administración
getAllAdmin(): Observable<PortfolioAdminModel[]> {
  return this.http.get<PortfolioAdminModel[]>(this.urlAdmin);
}

// Obtener un portfolio por UUID
getByUuidAdmin(uuid: string): Observable<PortfolioAdminModel> {
  return this.http.get<PortfolioAdminModel>(
    `${this.urlAdmin}/${uuid}`
  );
}

// Obtener portfolios por estado
getByEstadoAdmin(
  estado: EstadoVerificacion
): Observable<PortfolioAdminModel[]> {
  const params = new HttpParams()
    .set('estadoVerificacion', estado);

  return this.http.get<PortfolioAdminModel[]>(
    `${this.urlAdmin}/estadoVerificacion`,
    { params }
  );
}

// Aprobar portfolio
aprobarAdmin(
  uuid: string,
  notasAdmin?: string
): Observable<PortfolioAdminModel> {
  let params = new HttpParams();

  if (notasAdmin) {
    params = params.set('notasAdmin', notasAdmin);
  }

  return this.http.patch<PortfolioAdminModel>(
    `${this.urlAdmin}/aprobar/${uuid}`,
    null,
    { params }
  );
}

// Rechazar portfolio
rechazarAdmin(
  uuid: string,
  notasAdmin: string
): Observable<PortfolioAdminModel> {
  const params = new HttpParams()
    .set('notasAdmin', notasAdmin);

  return this.http.patch<PortfolioAdminModel>(
    `${this.urlAdmin}/rechazar/${uuid}`,
    null,
    { params }
  );
}
}
