import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ChatModel } from '../models/chat-model';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private baseUrl = 'http://localhost:8080/aquienllamo/chats';

  constructor(private http: HttpClient) {}

  // Todos mis chats, ya sea como cliente o como técnico
  getMisChats(): Observable<ChatModel[]> {
    return this.http.get<ChatModel[]>(`${this.baseUrl}/mis-chats`);
  }

  // Abre (o recupera) mi chat con un técnico
  iniciarChat(uuidTecnico: string): Observable<ChatModel> {
    return this.http.post<ChatModel>(`${this.baseUrl}/iniciar-chat`, { uuidTecnico });
  }
}