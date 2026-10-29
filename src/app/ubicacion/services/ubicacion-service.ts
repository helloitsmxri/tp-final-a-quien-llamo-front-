import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GoogleMapsModel } from '../models/GoogleMapsModel';
import { UbicacionModel } from '../models/ubicacion-model';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  
  private readonly API_UBICACIONES = 'http://localhost:8080/aquienllamo/ubicaciones';
  private readonly API_MAPS = 'http://localhost:8080/maps';

  constructor(private http: HttpClient) {}

  // Google Maps
  geocodificar(direccion: string) {
    return this.http.get<GoogleMapsModel>(`${this.API_MAPS}/geocode`, {
      params: { direccion }
    });
  }

  // CRUD
  crear(uuidUsuario: string, ubicacion: UbicacionModel) {
    return this.http.post<UbicacionModel>(`${this.API_UBICACIONES}/crear/${uuidUsuario}`, ubicacion);
  }

  getByUsuario(uuidUsuario: string) {
    return this.http.get<UbicacionModel[]>(`${this.API_UBICACIONES}/usuario/${uuidUsuario}`);
  }

  getByUuid(uuid: string) {
    return this.http.get<UbicacionModel>(`${this.API_UBICACIONES}/${uuid}`);
  }

  update(uuid: string, ubicacion: UbicacionModel) {
    return this.http.put<UbicacionModel>(`${this.API_UBICACIONES}/actualizar/${uuid}`, ubicacion);
  }

  delete(uuid: string) {
    return this.http.delete<UbicacionModel>(`${this.API_UBICACIONES}/eliminar/${uuid}`);
  }
}
