import { Injectable } from '@angular/core';
import { UsuarioModel } from '../../user/models/user-model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UsuarioRegisterModel } from '../models/user-register-model';
import { AuthLoginModel } from '../models/auth-login-model';
import { AuthResponseModel } from '../models/auth-response-model';
import { UsuarioRegisterResponseModel } from '../models/user-register-response-model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

    private readonly API_URL_REGISTER = 'http://localhost:8080/auth/register'
    private readonly API_URL_LOGIN = 'http://localhost:8080/auth/login'
    private readonly API_URL_FORGOT_PASSWORD = 'http://localhost:8080/auth/forgot-password';
    private readonly API_URL_RESET_PASSWORD = 'http://localhost:8080/auth/reset-password';
    private readonly API_ROLE_SUPER_ADMIN = 'http://localhost:8080/auth/role-super-admin';
    private readonly API_ROLE_ADMIN = 'http://localhost:8080/auth//role-admin';
    private readonly API_ROLE_TECNICO = 'http://localhost:8080/auth/role-tecnico';
    private readonly API_VALIDATE_TOKEN = 'http://localhost:8080/auth/validate-token';


    usuarios: UsuarioModel[] = [];
    usuario!: UsuarioModel;
    usuarioRegister!: UsuarioRegisterModel;

    private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isLoggedIn$ = this.loggedInSubject.asObservable();

    constructor(private http: HttpClient) {}

    // CREATE: registrar un usuario
      store(usuario: FormData): Observable<UsuarioRegisterResponseModel> {
          return this.http.post<UsuarioRegisterResponseModel>(this.API_URL_REGISTER,usuario);
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

   // Lee los roles que vienen dentro del token (claim "roles", ej: ["ROLE_USUARIO","ROLE_TECNICO"])
  getRoles(): string[] {
    const token = localStorage.getItem('accessToken');
    if (!token) return [];
    try {
      // el JWT usa base64url (- y _), atob necesita base64 normal (+ y /)
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(payload));
      return Array.isArray(decoded.roles) ? decoded.roles : [];
    } catch (e) {
      return [];
    }
  }

  esTecnico(): boolean {
    return this.getRoles().includes('ROLE_TECNICO');
  }

  //solicitar recuperacion de contraseña
    forgotPassword(email: string): Observable<void> {
        return this.http.post<void>(this.API_URL_FORGOT_PASSWORD, { email });
    }

    //restablecer contraseña mediante el token recibido por correo
    resetPassword(token: string, newPassword: string): Observable<void> {
        return this.http.post<void>(this.API_URL_RESET_PASSWORD, {
            token,
            newPassword
        });
    }

    validarToken(): Observable<void> {
    return this.http.get<void>(this.API_VALIDATE_TOKEN, {});
  }

  validarSuperAdmin(): Observable<void> {
      return this.http.get<void>(this.API_ROLE_SUPER_ADMIN, {});
  }

  validarAdmin(): Observable<void> {
      return this.http.get<void>(this.API_ROLE_ADMIN, {});
  }

  validarTecnico(): Observable<void> {
      return this.http.get<void>(this.API_ROLE_TECNICO, {});
  }


}
