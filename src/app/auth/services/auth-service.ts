import { Injectable } from '@angular/core';
import { UsuarioModel } from '../../user/models/user-model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
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

    private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.loggedInSubject.asObservable();

    constructor(private http: HttpClient) {}

    // CREATE: registrar un usuario
      store(usuario: FormData): Observable<UsuarioRegisterModel> {
          return this.http.post<UsuarioRegisterModel>(this.API_URL_REGISTER,usuario);
      }

    //Login
      login(login: AuthLoginModel): Observable<AuthResponseModel> {
    return this.http.post<AuthResponseModel>(this.API_URL_LOGIN, login).pipe(
      tap((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.loggedInSubject.next(true);
      })
    );
  }

  // LOGOUT: Cerrar sesión y limpiar almacenamiento
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.loggedInSubject.next(false);
  }

  // Comprueba si existe un token guardado
  hasToken(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Decodifica el token JWT y extrae el UUID del usuario autenticado
  getUuidUsuarioLogueado(): string | null {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);

      // Devuelve el atributo UUID del payload (sub, uuid, id, etc.)
      return decoded.uuid || decoded.sub || null;
    } catch (e) {
      console.error('Error al decodificar el token JWT:', e);
      return null;
    }
  }
}
