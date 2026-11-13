import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UsuarioModel } from '../../user/models/user-model';
import { ChangeRoll } from '../models/change-roll';
import { AdministradorModel } from '../models/AdministradorModel';

@Injectable({
  providedIn: 'root',
})
export class AdminService {

    private http = inject(HttpClient);
    private readonly API_ADMINISTRADORES_URL = 'http://localhost:8080/aquienllamo/administradores';
    private readonly API_CHANGEROLL_URL = `${this.API_ADMINISTRADORES_URL}/changeRol`;
    private readonly API_REMOVEROLL_URL = `${this.API_ADMINISTRADORES_URL}/removeRolAdmin`;
    private readonly API_AMONESTAR_URL = `${this.API_ADMINISTRADORES_URL}/amonestar`;
    private readonly API_BAJAUSUARIO_URL = `${this.API_ADMINISTRADORES_URL}/baja`;
    private readonly API_QUITARSUSPENSION_URL = `${this.API_ADMINISTRADORES_URL}/quitar-suspension`;
    private readonly API_QUITARBAJA_URL = `${this.API_ADMINISTRADORES_URL}/quitar-baja`;
    private readonly API_USUARIOS_URL = 'http://localhost:8080/aquienllamo/usuarios';
    private readonly API_ALLUSERS_URL = `${this.API_USUARIOS_URL}/todos`;
    private readonly API_FINDUSERBYDNI_URL = `${this.API_USUARIOS_URL}/usuario/dni`;
    private readonly API_FINDUSERBYEMAIL_URL = `${this.API_USUARIOS_URL}/usuario/email`;
 
    // OBTENER TODOS LOS ADMINISTRADORES
  obtenerAdministradores() {
    return this.http.get<AdministradorModel[]>(
      this.API_ADMINISTRADORES_URL
    );
  }


  // OBTENER TODOS LOS USUARIOS
  getAll() {
    return this.http.get<UsuarioModel[]>(this.API_ALLUSERS_URL);
  }


  // BUSCAR USUARIO POR DNI
  getUserByDNI(dni: string) {
    return this.http.get<UsuarioModel>(
      `${this.API_FINDUSERBYDNI_URL}/${dni}`
    );
  }


  // BUSCAR USUARIO POR EMAIL
  getUserByEmail(email: string) {
    return this.http.get<UsuarioModel>(
      `${this.API_FINDUSERBYEMAIL_URL}/${email}`
    );
  }


  // CAMBIAR ROL
  changeRoll(changeRoll: ChangeRoll) {
    return this.http.post<string>(
      this.API_CHANGEROLL_URL,
      changeRoll
    );
  }


  // QUITAR ROL DE ADMINISTRADOR
  removeRoll(uuid: string) {
    return this.http.patch<string>(
      `${this.API_REMOVEROLL_URL}/${uuid}`,
      null
    );
  }


  // AMONESTAR / SUSPENDER USUARIO
  amonestarUsuario(uuid: string, motivo: string) {
    return this.http.patch<string>(
      `${this.API_AMONESTAR_URL}/${uuid}`,
      null,
      { params: { motivo } }
    );
  }


  // DAR DE BAJA USUARIO
  bajaUsuario(uuid: string) {
    return this.http.patch<string>(
      `${this.API_BAJAUSUARIO_URL}/${uuid}`,
      null
    );
  }


  // QUITAR SUSPENSIÓN
  quitarSuspension(uuid: string) {
    return this.http.patch<string>(
      `${this.API_QUITARSUSPENSION_URL}/${uuid}`,
      null
    );
  }


  // REACTIVAR CUENTA DADA DE BAJA
  quitarBaja(uuid: string) {
    return this.http.patch<string>(
      `${this.API_QUITARBAJA_URL}/${uuid}`,
      null
    );
  }
}
