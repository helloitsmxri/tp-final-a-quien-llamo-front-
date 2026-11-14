
import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ListaChat } from '../lista-chat/lista-chat';
import { DetalleChat } from '../detalle-chat/detalle-chat';
import { ChatModel } from '../../models/chat-model';

@Component({
  selector: 'app-chat-view',
  standalone: true,
  imports: [ListaChat, DetalleChat],
  templateUrl: './chat-view.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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