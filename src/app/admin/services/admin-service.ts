import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UsuarioModel } from '../../user/models/user-model';
import { ChangeRoll } from '../models/change-roll';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
    private readonly http = inject(HttpClient);

    //  
    private readonly API_ADMINISTRADORES_URL = "http://localhost:8080/aquienllamo/administradores";
    private readonly API_CHANGEROLL_URL = `${this.API_ADMINISTRADORES_URL}/changeRol`;
    private readonly API_REMOVEROLL_URL = `${this.API_ADMINISTRADORES_URL}/removeRolAdmin`;
    private readonly API_AMONESTAR_URL = `${this.API_ADMINISTRADORES_URL}/amonestar`;
    private readonly API_BAJAUSUARIO_URL = `${this.API_ADMINISTRADORES_URL}/baja/{uuid}`;
    private readonly API_QUITARSUSPENSION_URL = `${this.API_ADMINISTRADORES_URL}/quitar-suspension/{uuid}`;
    private readonly API_QUITARBAJA_URL = `${this.API_ADMINISTRADORES_URL}/quitar-baja/{uuid}`;

    //  
    private readonly API_USUARIOS_URL = "http://localhost:8080/aquienllamo/usuarios";
    private readonly API_ALLUSERS_URL = `${this.API_USUARIOS_URL}/todos`;
    private readonly API_FINDUSERBYDNI_URL = `${this.API_USUARIOS_URL}/usuario/dni/{dni}`;
    private readonly API_FINDUSERBYEMAIL_URL = `${this.API_USUARIOS_URL}/usuario/email`;

    getAll(){
        return this.http.get<UsuarioModel[]>(`${this.API_ALLUSERS_URL}`)
    }

    getUserByEmail(email:string){
        return this.http.get<UsuarioModel>(`${this.API_FINDUSERBYEMAIL_URL}/${email}`)
    }

    getUserByDNI(DNI:string){
        return this.http.get<UsuarioModel>(`${this.API_FINDUSERBYDNI_URL}/${DNI}`)
    }

    changeRoll(changeRoll : ChangeRoll){
        return this.http.post<void>(`${this.API_CHANGEROLL_URL}`,changeRoll);
    }

    removeRoll(uuid: string) {
        return this.http.patch<void>(`${this.API_REMOVEROLL_URL}/${uuid}`, null);
    }

    amonestarUsuario(uuid: string) {
        return this.http.patch<void>(`${this.API_AMONESTAR_URL}/${uuid}`, null);
    }

    bajaUsuario(uuid: string) {
        return this.http.patch<void>(`${this.API_BAJAUSUARIO_URL}/${uuid}`, null);
    }

    quitarSuspension(uuid: string) {
        return this.http.patch<void>(`${this.API_QUITARSUSPENSION_URL}/${uuid}`, null);
    }

    quitarBaja(uuid: string) {
        return this.http.patch<void>(`${this.API_QUITARBAJA_URL}/${uuid}`, null);
    }
}
