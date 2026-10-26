import { Injectable } from '@angular/core';
import { UsuarioModel } from '../../user/models/user-model';
<<<<<<< Updated upstream
import { UsuarioModelRegister } from '../../user/models/user-model-register';
=======
import { UsuarioModelRegister } from '../models/user-model-register';
>>>>>>> Stashed changes
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {

<<<<<<< Updated upstream
    private readonly API_URL = 'http://localhost:8080/api/usuarios';
=======
>>>>>>> Stashed changes
    private readonly API_URL_REGISTER = 'http://localhost:8080/auth/register'

    usuarios: UsuarioModel[] = [];
    usuario!: UsuarioModel;
    usuarioRegister!: UsuarioModelRegister;

    constructor(private http: HttpClient) {}

    // CREATE: registrar un usuario
      store(usuario: FormData): Observable<UsuarioModelRegister> {
<<<<<<< Updated upstream
          return this.http.post<UsuarioModelRegister>(
          this.API_URL_REGISTER,
          usuario
          );
=======
          return this.http.post<UsuarioModelRegister>(this.API_URL_REGISTER,usuario);
>>>>>>> Stashed changes
      }
}
