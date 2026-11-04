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

 iniciarChat(idUsuario: number, idTecnico: number): Observable<ChatModel> {
  const requestBody = { idUsuario, idTecnico };
  return this.http.post<ChatModel>('http://localhost:8080/aquienllamo/chats/iniciar-chat', requestBody);
}

  getByUsuario(uuidUsuario: string): Observable<ChatModel[]> {
    return this.http.get<ChatModel[]>(`${this.baseUrl}/listar-chats-por-usuario/${uuidUsuario}`);
  }
}