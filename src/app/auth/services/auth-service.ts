import { Injectable } from '@angular/core';
import { UsuarioModel } from '../../user/models/user-model';
import { UsuarioModelRegister } from '../models/user-model-register';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModelLogin } from '../models/user-model-login';
import { AuthResponseModel } from '../models/AuthResponseModel';

@Injectable({
  providedIn: 'root',
})
export class AuthService{

    private readonly API_URL_REGISTER = 'http://localhost:8080/auth/register'
    private readonly API_URL_LOGIN = 'http://localhost:8080/auth/login'
    private readonly API_URL_VALIDAR_TOKEN = 'http://localhost:8080/auth/login'
    usuarios: UsuarioModel[] = [];
    usuario!: UsuarioModel;
    usuarioRegister!: UsuarioModelRegister;

    constructor(private http: HttpClient) {}

    // CREATE: registrar un usuario
        store(usuario: FormData): Observable<UsuarioModelRegister> {
            return this.http.post<UsuarioModelRegister>(this.API_URL_REGISTER,usuario);
        }

        login(login:UserModelLogin): Observable<AuthResponseModel> {
            return this.http.post<AuthResponseModel>(this.API_URL_LOGIN,login);
        }

        validarToken(){
            
        }
}
