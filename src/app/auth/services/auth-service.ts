import { Injectable } from '@angular/core';
import { UsuarioModel } from '../../user/models/user-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioRegisterModel } from '../models/user-register-model';
import { AuthLoginModel } from '../models/auth-login-model';
import { AuthResponseModel } from '../models/auth-response-model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

    private readonly API_URL_REGISTER = 'http://localhost:8080/auth/register'
    private readonly API_URL_LOGIN = 'http://localhost:8080/auth/login'

    usuarios: UsuarioModel[] = [];
    usuario!: UsuarioModel;
    usuarioRegister!: UsuarioRegisterModel;

    constructor(private http: HttpClient) {}

    // CREATE: registrar un usuario
      store(usuario: FormData): Observable<UsuarioRegisterModel> {
          return this.http.post<UsuarioRegisterModel>(this.API_URL_REGISTER,usuario);
      }

    //Login
      login(login: AuthLoginModel): Observable<AuthResponseModel> {
          return this.http.post<AuthResponseModel>(this.API_URL_LOGIN,login);
      }
}
