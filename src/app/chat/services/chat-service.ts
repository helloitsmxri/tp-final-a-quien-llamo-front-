import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatModel } from '../models/chat-model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private baseUrl = 'http://localhost:8080/aquienllamo/chats';

  constructor(private http: HttpClient) {}

  iniciarChat(datosRequest: any): Observable<ChatModel> {
    return this.http.post<ChatModel>(`${this.baseUrl}/iniciar-chat`, datosRequest);
  }

  getByUsuario(uuidUsuario: string): Observable<ChatModel[]> {
    return this.http.get<ChatModel[]>(`${this.baseUrl}/listar-chats-por-usuario/${uuidUsuario}`);
  }
}