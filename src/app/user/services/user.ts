
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../models/user-model';
import { UserPatchModel } from '../../user/models/user-patch-model'
import { UserProfileDTO } from '../models/user-profile-DTO';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class UsuarioService {

    private http = inject(HttpClient);
    private url = "http://localhost:8080/aquienllamo/usuarios"


    // editar perfil
    // {uuid} -> hay q cambiar esto para q sea así y no con 'actualizar' x el momento lo dejo porq sino hay q tocar el back
    // recibe el FormData directamente desde el componente
    updateMyProfile(formData: FormData): Observable<UserProfileDTO> {
    return this.http.patch<UserProfileDTO>(`${this.url}/mi-perfil`, formData);
    }

    // obtener todos los usuarios
    getAll(){
        return this.http.get<UsuarioModel[]>(`${this.url}/todos`)
    }

    // obtener un perfil de usuario
    // perfil/{uuid}
    getProfile(uuid : string){
        return this.http.get<UserProfileDTO>(`${this.url}/${uuid}`);
    }

    // eliminar un usuario
    // {uuid} -> hay q cambiar esto para q sea así y no con 'eliminar' x el momento lo dejo porq sino hay q tocar el back
    deleteUser(uuid : string){
        return this.http.delete<void>(`${this.url}/eliminar/${uuid}`);
    }

    // ver mi perfil
    // mi-perfil
    getMyProfile(): Observable<UserProfileDTO> {
    return this.http.get<UserProfileDTO>(`${this.url}/mi-perfil`);
  }

}
