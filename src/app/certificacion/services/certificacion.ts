
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CertificacionModel } from '../models/certificacion-model';
import { CertificacionDatos } from '../models/certificacion-datos';
import { EstadoVerificacion } from '../enum/estado-verificacion';

@Injectable({ providedIn: 'root' })
export class CertificacionService {

    private readonly url = 'http://localhost:8080/aquienllamo/certificaciones';
    private http = inject(HttpClient)


  //TECNICO
  // GET /tecnico/{uuid}: ADMINISTRADOR o TECNICO
  getByTecnico(uuidTecnico: string): Observable<CertificacionModel[]> {
    return this.http.get<CertificacionModel[]>(`${this.url}/tecnico/${uuidTecnico}`);
  }
 
  // POST /tecnico/{uuid}: ROLE_TECNICO (hace falta token)
  crear(uuidTecnico: string, datos: CertificacionDatos): Observable<CertificacionModel> {
    return this.http.post<CertificacionModel>(`${this.url}/tecnico/${uuidTecnico}`, this.aFormData(datos));
  }
 
  //ADMINISTRADOR
  getAll(): Observable<CertificacionModel[]> {
    return this.http.get<CertificacionModel[]>(this.url);
  }
 
  getByUuid(uuid: string): Observable<CertificacionModel> {
    return this.http.get<CertificacionModel>(`${this.url}/${uuid}`);
  }
 
  getByEstado(estado: EstadoVerificacion): Observable<CertificacionModel[]> {
    return this.http.get<CertificacionModel[]>(`${this.url}/estado/${estado}`);
  }
 
  //PUT /actualizar/{uuid}: el back reescribe matricula, ente y vencimiento; el archivo es opcional
  actualizar(uuid: string, datos: CertificacionDatos): Observable<CertificacionModel> {
    return this.http.put<CertificacionModel>(`${this.url}/actualizar/${uuid}`, this.aFormData(datos));
  }
 
  aprobar(uuid: string): Observable<CertificacionModel> {
    return this.http.patch<CertificacionModel>(`${this.url}/aprobar/${uuid}`, null);
  }
 
  //el motivo viaja como query param (?motivo=...), no en el body
  rechazar(uuid: string, motivo: string): Observable<CertificacionModel> {
    const params = new HttpParams().set('motivo', motivo);
    return this.http.patch<CertificacionModel>(`${this.url}/rechazar/${uuid}`, null, { params });
  }
 
  eliminar(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/eliminar/${uuid}`);
  }
 
  //no setear Content-Type a mano: el navegador agrega el boundary del multipart solo.
  private aFormData(datos: CertificacionDatos): FormData {
    const fd = new FormData();
    fd.append('numMatricula', datos.numMatricula);
    fd.append('enteOtorgador', datos.enteOtorgador);
    fd.append('fechaVencimiento', datos.fechaVencimiento); // yyyy-MM-dd
    fd.append('imagenCertificado', datos.archivo);
    return fd;
  }
}
