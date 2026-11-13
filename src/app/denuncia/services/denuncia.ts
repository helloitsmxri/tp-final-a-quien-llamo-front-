
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DenunciaModel } from '../models/denuncia-model';
import { EstadoDenuncia } from '../enum/estado-denuncia';

@Injectable({ providedIn: 'root' })
export class DenunciaService {

  private url = 'http://localhost:8080/aquienllamo/denuncias';
  private http = inject(HttpClient);

  // consultar denuncias como administrador - TODAS -
  obtenerTodasLasDenuncias() {
    return this.http.get<DenunciaModel[]>(this.url);
  }

  // obtener una denuncia específica
  obtenerDenuncia(uuid : string){
    return this.http.get<DenunciaModel>(`${this.url}/${uuid}`);
  }

  // crear denuncia desde un chat
  crearDenunciaChat(uuidChat : string, motivoDenuncia: string, foto ?: File){
    // revisar esto con pau
    const formData = new FormData();
    formData.append('motivoDenuncia', motivoDenuncia);
    if (foto){
      formData.append('foto', foto);
    }

    return this.http.post<DenunciaModel>(`${this.url}/crear/chat/${uuidChat}`, formData);
  }

  // crear denuncia desde un perfil
  crearDenunciaPerfil (uuidDenunciado : string, motivoDenuncia : string, foto ?: File){
    const formData = new FormData;

    formData.append('motivoDenuncia', motivoDenuncia);
    if (foto){
      formData.append('foto', foto);
    }

    return this.http.post<DenunciaModel>(`${this.url}/crear/perfil/${uuidDenunciado}`, formData);
  }

  // obtener foto de la denuncia
  obtenerFoto(uuid: string){
    return this.http.get(`${this.url}/${uuid}/foto`, {responseType: 'blob'});
  }

  // obtener denunciais por estado siendo ADMIN
  obtenerPorEstado(estado: EstadoDenuncia){
    return this.http.get<DenunciaModel[]>(`${this.url}/estado/${estado}`);
  }

  // obtener denuncias q aun no tienen un admin asignadooo
  obtenerSinAsignar (){
    return this.http.get<DenunciaModel[]>(`${this.url}/sin-asignar`);
  }

  // obtener MIS denuncias
  obtenerMisDenuncias(tipo: 'CREADAS' | 'RECIBIDAS'){
    if (tipo === 'CREADAS'){
      return this.http.get<DenunciaModel[]>(`${this.url}/mis-denuncias/creadas`);
    }

    return this.http.get<DenunciaModel[]>(`${this.url}/mis-denuncias/recibidas`);
  }

  // asignar UN ADMIN p una denuncia
  asignarAdministrador(uuidDenuncia : string, uuidAdministrador : string){
    return this.http.patch<DenunciaModel>(`${this.url}/${uuidDenuncia}/asignar-administrador/${uuidAdministrador}`,{});
  }

  // aprobar una denuncia
  aprobarDenuncia(uuid: string, mensaje : string){
    return this.http.patch<DenunciaModel>(`${this.url}/${uuid}/aprobar`, null, {params : {mensaje} });
  }

  // rechazar la denuncia 
  rechazarDenuncia (uuid : string, mensaje : string){
    return this.http.patch<DenunciaModel>(`${this.url}/${uuid}/rechazar`, null, { params : {mensaje}});
  }

  // obtener denuncias asignadas al admin:
  obtenerMisDenunciasAdmin(estado ?: EstadoDenuncia){
    if (estado){
      return this.http.get<DenunciaModel[]>(`${this.url}/mis-denuncias`, {params : {estado}});
    }

    return this.http.get<DenunciaModel[]>(`${this.url}/mis-denuncias`);
  }

  // ordenar x fecha -mas viejas mas nuevas-
  ordenarDenuncias(orden : 'asc' | 'desc' = 'desc'){
    return this.http.get<DenunciaModel[]>(`${this.url}/ordenar`, {params : {orden}});
  }
}
