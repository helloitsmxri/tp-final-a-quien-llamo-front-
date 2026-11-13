import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChatModel } from '../../models/chat-model';
import { ChatService } from '../../services/chat-service';
import { UsuarioService } from '../../../user/services/user';

@Component({
  selector: 'app-lista-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-chat.html',
  styleUrl: './lista-chat.css',
})
export class ListaChat implements OnInit {
  chats: ChatModel[] = [];
  chatSeleccionado: ChatModel | null = null;
  filtroBusqueda = '';

  private miUuid = '';

  // Chats que abrí en esta sesión y todavía no tienen ningún mensaje
  private chatsSinMensajes = new Set<string>();

  // Avisa al padre (ChatView) qué chat se seleccionó
  @Output() chatSeleccionadoEvent = new EventEmitter<ChatModel>();

  constructor(
    private chatService: ChatService,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    forkJoin({
      perfil: this.usuarioService.getMyProfile(),
      chats: this.chatService.getMisChats().pipe(
        catchError((err) => {
          console.error('Error al cargar chats:', err);
          return of([] as ChatModel[]);
        }),
      ),
    }).subscribe({
      next: ({ perfil, chats }) => {
        this.miUuid = (perfil as any).uuid;
        this.chats = chats;

        // Solo abrimos un chat automáticamente si venimos del botón "Contactame" (?tecnico=UUID)
        const uuidTecnico = this.route.snapshot.queryParamMap.get('tecnico');
        if (uuidTecnico) {
          this.abrirChatCon(uuidTecnico);
        }
      },
      error: (err) => console.error('No se pudo obtener tu perfil:', err),
    });
  }

  // ¿En este chat yo soy el cliente?
  private soyElCliente(chat: ChatModel): boolean {
    return chat.uuidUsuario === this.miUuid;
  }

  // Nombre de la OTRA persona del chat
  nombreChat(chat: ChatModel): string {
    return (this.soyElCliente(chat) ? chat.nombreTecnico : chat.nombreUsuario) || 'Contacto';
  }

  avatar(nombre: string): string {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nombre);
  }

  seleccionarChat(chat: ChatModel): void {
    // Si me voy de un chat que sigue vacío, lo saco de la lista
    const anterior = this.chatSeleccionado;
    if (
      anterior &&
      anterior.uuidChat !== chat.uuidChat &&
      this.chatsSinMensajes.has(anterior.uuidChat)
    ) {
      this.chats = this.chats.filter((c) => c.uuidChat !== anterior.uuidChat);
      this.chatsSinMensajes.delete(anterior.uuidChat);
    }

    this.chatSeleccionado = chat;
    this.chatSeleccionadoEvent.emit(chat);
  }

  // Lo llama ChatView cuando aparece un mensaje en un chat: ya no está vacío
  marcarConMensajes(uuidChat: string): void {
    this.chatsSinMensajes.delete(uuidChat);
  }

  // Abre mi chat con un técnico; si todavía no existe, lo crea
  private abrirChatCon(uuidTecnico: string): void {
    const existente = this.chats.find(
      (c) => c.uuidTecnico === uuidTecnico && this.soyElCliente(c),
    );
    if (existente) {
      this.seleccionarChat(existente);
      return;
    }

    this.chatService.iniciarChat(uuidTecnico).subscribe({
      next: (chatCreado) => {
        // No estaba en mi lista, o sea que no tiene mensajes todavía
        this.chatsSinMensajes.add(chatCreado.uuidChat);
        this.chats = [chatCreado, ...this.chats];
        this.seleccionarChat(chatCreado);
      },
      error: (err) => {
        console.error('Error al iniciar el chat:', err);
      },
    });
  }

  get chatsFiltrados(): ChatModel[] {
    const f = this.filtroBusqueda.trim().toLowerCase();
    if (!f) return this.chats;
    return this.chats.filter((c) => this.nombreChat(c).toLowerCase().includes(f));
  }
}