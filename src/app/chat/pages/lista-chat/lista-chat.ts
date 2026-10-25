import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatModel } from '../../models/chat-model';
import { ChatService } from '../../services/chat-service';

@Component({
  selector: 'app-lista-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-chat.html',
  styleUrl: './lista-chat.css',
})
export class ListaChat implements OnInit{
  chats: ChatModel[] = [];
  chatSeleccionado: ChatModel | null = null;
  currentUuidUsuario: string = 'uuid-del-usuario-actual';
  filtroBusqueda: string = '';

  // Evento para avisarle al padre (ChatView) qué chat se seleccionó
  @Output() chatSeleccionadoEvent = new EventEmitter<ChatModel>();

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.cargarChats();
  }

  cargarChats(): void {
    this.chatService.getByUsuario(this.currentUuidUsuario).subscribe({
      next: (data) => {
        this.chats = data;
        if (this.chats.length > 0) {
          this.seleccionarChat(this.chats[0]); // Selecciona el primero por defecto
        }
      },
      error: (err) => console.error('Error al cargar chats:', err)
    });
  }

  seleccionarChat(chat: ChatModel): void {
    this.chatSeleccionado = chat;
    this.chatSeleccionadoEvent.emit(chat); // Dispara el evento hacia ChatView
  }

}
