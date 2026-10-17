
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioModel } from '../models/user-model';


@Injectable({ providedIn: 'root' })
export class UsuarioService {

    private readonly API_URL = 'http://localhost:8080/api/usuarios';

    usuarios: UsuarioModel[] = [];
    usuario!: UsuarioModel;

    constructor(private http: HttpClient) {}

    // READ: obtener todos los usuarios
    getAll(): Observable<UsuarioModel[]> {
        return this.http.get<UsuarioModel[]>(this.API_URL);
    }

    // READ: obtener un usuario por UUID
    getByUuid(uuid: string): Observable<UsuarioModel> {
        return this.http.get<UsuarioModel>(
        `${this.API_URL}/${uuid}`
        );
    }

  // CREATE: registrar un usuario
    store(usuario: Partial<UsuarioModel>): Observable<UsuarioModel> {
        return this.http.post<UsuarioModel>(
        this.API_URL,
        usuario
        );
    }

  // UPDATE: actualizar un usuario
    update(uuid: string,usuario: Partial<UsuarioModel>): Observable<UsuarioModel> {
        return this.http.put<UsuarioModel>(
            `${this.API_URL}/${uuid}`,
            usuario
        );
    }

  // DELETE: eliminar un usuario
    delete(uuid: string): Observable<void> {
        return this.http.delete<void>(
            `${this.API_URL}/${uuid}`
        );
    }
}
