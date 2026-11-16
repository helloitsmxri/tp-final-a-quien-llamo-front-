
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ChatModel } from '../../models/chat-model';
import { ChatService } from '../../services/chat-service';
import { UsuarioService } from '../../../user/services/user';

@Component({
  selector: 'app-lista-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-chat.html',
  styleUrl: './lista-chat.css',
})
export class ListaChat implements OnInit {

  chats: ChatModel[] = [];

  chatSeleccionado: ChatModel | null = null;

  filtroBusqueda = '';

  private miUuid = '';

  private chatsSinMensajes = new Set<string>();

  @Output() chatSeleccionadoEvent =
    new EventEmitter<ChatModel>();

  constructor(
    private chatService: ChatService,
    private usuarioService: UsuarioService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    forkJoin({
      perfil: this.usuarioService.getMyProfile(),
      chats: this.chatService.getMisChats().pipe(
        catchError((err) => {
          console.error('Error al cargar chats:', err);
          return of([] as ChatModel[]);
        })
      )
    }).subscribe({
      next: ({ perfil, chats }) => {
        this.miUuid = perfil.uuid;
        this.chats = chats;

        // c esto actualizamos el angular
        this.cdr.markForCheck();

        const uuidTecnico =
          this.route.snapshot.queryParamMap.get('tecnico');

        if (uuidTecnico) {
          this.abrirChatCon(uuidTecnico);
        }
      },
      error: (err) => {
        console.error('No se pudo obtener tu perfil:', err);
        this.cdr.markForCheck();
      }
    });
  }

  private soyElCliente(chat: ChatModel): boolean {
    return chat.uuidUsuario === this.miUuid;
  }

  nombreChat(chat: ChatModel): string {

    return (
      this.soyElCliente(chat)
        ? chat.nombreTecnico
        : chat.nombreUsuario
    ) || 'Contacto';
  }

  avatar(nombre: string): string {

    return 'https://ui-avatars.com/api/?name='
      + encodeURIComponent(nombre)
      + '&background=eee8ff&color=6c4fe0&bold=true';
  }

  seleccionarChat(chat: ChatModel): void {

    const anterior = this.chatSeleccionado;

    if (
      anterior &&
      anterior.uuidChat !== chat.uuidChat &&
      this.chatsSinMensajes.has(anterior.uuidChat)
    ) {
      this.chats = this.chats.filter(
        c => c.uuidChat !== anterior.uuidChat
      );

      this.chatsSinMensajes.delete(anterior.uuidChat);
    }

    this.chatSeleccionado = chat;

    this.chatSeleccionadoEvent.emit(chat);
  }

  marcarConMensajes(uuidChat: string): void {
    this.chatsSinMensajes.delete(uuidChat);
  }

  private abrirChatCon(uuidTecnico: string): void {

    const existente = this.chats.find(
      c =>
        c.uuidTecnico === uuidTecnico &&
        this.soyElCliente(c)
    );

    if (existente) {
      this.seleccionarChat(existente);
      return;
    }

    this.chatService.iniciarChat(uuidTecnico).subscribe({

      next: (chatCreado) => {

        this.chatsSinMensajes.add(chatCreado.uuidChat);

        this.chats = [chatCreado, ...this.chats];

        this.seleccionarChat(chatCreado);
      },

      error: (err) => {
        console.error('Error al iniciar el chat:', err);
      }
    });
  }

  get chatsFiltrados(): ChatModel[] {

    const filtro = this.filtroBusqueda.trim().toLowerCase();

    if (!filtro) {
      return this.chats;
    }

    return this.chats.filter(chat =>
      this.nombreChat(chat).toLowerCase().includes(filtro)
    );
  }
}
