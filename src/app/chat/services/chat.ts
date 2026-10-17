
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatModel } from '../models/chat-model';

@Injectable({ providedIn: 'root' })
export class ChatService {

    private readonly API_URL = 'http://localhost:8080/api/chats';

    chats: ChatModel[] = [];
    chat!: ChatModel;

    constructor(private http: HttpClient) {}

  // READ: obtener todos los chats
    getAll(): Observable<ChatModel[]> {
        return this.http.get<ChatModel[]>(this.API_URL);
    }

  // READ: obtener un chat por UUID
    getByUuid(uuid: string): Observable<ChatModel> {
        return this.http.get<ChatModel>(
        `${this.API_URL}/${uuid}`
        );
    }

  // CREATE: crear un chat
    store(chat: Partial<ChatModel>): Observable<ChatModel> {
        return this.http.post<ChatModel>(
        this.API_URL,
        chat
        );
    }

  // UPDATE: actualizar un chat
    update(uuid: string,chat: Partial<ChatModel>): Observable<ChatModel> {
    return this.http.put<ChatModel>(
        `${this.API_URL}/${uuid}`,
        chat
        );
    }

  // DELETE: eliminar un chat
    delete(uuid: string): Observable<void> {
        return this.http.delete<void>(
        `${this.API_URL}/${uuid}`
        );
    }
}
