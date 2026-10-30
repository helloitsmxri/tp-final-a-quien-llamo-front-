
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../models/user-model';
import { UserPatchModel } from '../../user/models/user-patch-model'
import { UserProfileDTO } from '../models/user-profile-DTO';


@Injectable({ providedIn: 'root' })
export class UsuarioService {

    private http = inject(HttpClient);
    private url = "http://localhost:8080/aquienllamo/usuarios"


    // editar perfil
    // {uuid} -> hay q cambiar esto para q sea así y no con 'actualizar' x el momento lo dejo porq sino hay q tocar el back
    patchProfile(usuario : UserPatchModel, uuid : string){
        return this.http.patch<UsuarioModel>(`${this.url}/actualizar/${uuid}`, usuario);
    }

    // obtener todos los usuarios
    getAll(){
        return this.http.get<UsuarioModel[]>(`${this.url}/todos`)
    }

    // obtener un perfil de usuario
    // perfil/{uuid}
    getProfile(usuario : UserProfileDTO){
        return this.http.get<UserProfileDTO>(`${this.url}/${usuario.uuid}`);
    }

    // eliminar un usuario
    // {uuid} -> hay q cambiar esto para q sea así y no con 'eliminar' x el momento lo dejo porq sino hay q tocar el back
    deleteUser(usuario : UsuarioModel){
        return this.http.delete<UsuarioModel>(`${this.url}/eliminar/${usuario.uuid}`);
    }

    // ver mi perfil
    // mi-perfil
    getMyProfile(){
        return this.http.get<UserProfileDTO>(`${this.url}/$`)
    }

}
