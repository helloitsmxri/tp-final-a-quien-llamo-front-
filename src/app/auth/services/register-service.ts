import { Injectable } from '@angular/core';
import { UsuarioModel } from '../../user/models/user-model';
import { UsuarioModelRegister } from '../../user/models/user-model-register';

import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {

    private readonly API_URL_REGISTER = 'http://localhost:8080/auth/register'

    usuarios: UsuarioModel[] = [];
    usuario!: UsuarioModel;
    usuarioRegister!: UsuarioModelRegister;

    constructor(private http: HttpClient) {}

    // CREATE: registrar un usuario
      store(usuario: FormData): Observable<UsuarioModelRegister> {
          return this.http.post<UsuarioModelRegister>(this.API_URL_REGISTER,usuario);
      }
}
