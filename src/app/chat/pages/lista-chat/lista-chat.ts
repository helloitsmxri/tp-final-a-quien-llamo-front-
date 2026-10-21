import { Component, OnInit } from '@angular/core';
import { ChatModel } from '../../models/chat-model';
import { ChatService } from '../../services/chat';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-chat',
  imports: [],
  templateUrl: './lista-chat.html',
  styleUrl: './lista-chat.css',
})
export class ListaChat implements OnInit {

  chats: ChatModel[] = [];

  currentUuidUsuario: string = 'uuid-del-usuario-actual'; 

  constructor(
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarChats();
  }

  cargarChats(): void {
    this.chatService.getByUsuario(this.currentUuidUsuario).subscribe({
      next: (data) => this.chats = data,
      error: (err) => console.error('Error al obtener la lista de chats', err)
    });
  }

  abrirChat(uuidChat: string): void {
    this.router.navigate(['/mensajes', uuidChat]);
  }
}
