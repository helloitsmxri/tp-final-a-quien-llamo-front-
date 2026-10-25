import { Injectable } from '@angular/core';
import { ChatModel } from '../models/chat-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

   private readonly API_URL = 'http://localhost:8080/api/chats'; 


    chats: ChatModel[] = []; 
    chat!: ChatModel; 

    constructor(private http: HttpClient) {} 


iniciarChat(idUsuario: number, idTecnico: number): Observable<ChatModel> { 
    return this.http.post<ChatModel>(`${this.API_URL}/iniciar`, { idUsuario, idTecnico }); 
  } 

 

  // GET: Traer los chats de un usuario según su UUID 

  getByUsuario(uuidUsuario: string): Observable<ChatModel[]> { 
    return this.http.get<ChatModel[]>(`${this.API_URL}/usuario/${uuidUsuario}`); 
  } 

 

  // GET: Traer los chats de un técnico según su UUID 

  getByTecnico(uuidTecnico: string): Observable<ChatModel[]> { 
    return this.http.get<ChatModel[]>(`${this.API_URL}/tecnico/${uuidTecnico}`); 
  } 
  // GET: Buscar un chat específico por su UUID 

  getByUuid(uuidChat: string): Observable<ChatModel> { 
    return this.http.get<ChatModel>(`${this.API_URL}/${uuidChat}`); 
  }
  
}
