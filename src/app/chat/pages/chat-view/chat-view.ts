import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ListaChat } from '../lista-chat/lista-chat';
import { DetalleChat } from '../detalle-chat/detalle-chat';
import { ChatModel } from '../../models/chat-model';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [CommonModule, ListaChat, DetalleChat],
  templateUrl: './chat-view.html',
  styleUrl: './chat-view.css',
})
export class ChatView {

  @ViewChild(ListaChat) private lista?: ListaChat;

  chatSeleccionado: ChatModel | null = null;

  alSeleccionarChat(chat: ChatModel): void {
    this.chatSeleccionado = chat;
  }

  // Aparece un mensaje en un chat: la lista ya no debe tratarlo como vacío
  alMensajeNuevo(uuidChat: string): void {
    this.lista?.marcarConMensajes(uuidChat);
  }
}