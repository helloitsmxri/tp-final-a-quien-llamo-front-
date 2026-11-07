import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChatModel } from '../../models/chat-model';
import { ChatService } from '../../services/chat-service';
import { UsuarioService } from '../../../user/services/user';
import { TecnicoService } from '../../../tecnico/services/tecnico';

// Así llega cada técnico desde GET /aquienllamo/tecnicos (TecnicoDTOResponse, es plano)
interface TecnicoLista {
  uuid: string;
  nombre: string;
  uuidUsuario?: string; // solo si lo agregás al backend (opcional, ver "Siguientes pasos")
}

@Component({
  selector: 'app-lista-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-chat.html',
  styleUrl: './lista-chat.css',
})
export class ListaChat implements OnInit {
  chats: ChatModel[] = [];
  tecnicos: TecnicoLista[] = [];
  chatSeleccionado: ChatModel | null = null;
  filtroBusqueda = '';

  private miUuid = '';

  // Avisa al padre (ChatView) qué chat se seleccionó
  @Output() chatSeleccionadoEvent = new EventEmitter<ChatModel>();

  constructor(
    private chatService: ChatService,
    private usuarioService: UsuarioService,
    private tecnicoService: TecnicoService,
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
      tecnicos: this.tecnicoService.getTecnicos().pipe(
        catchError((err) => {
          console.error('Error al cargar técnicos:', err);
          return of([] as any[]);
        }),
      ),
    }).subscribe({
      next: ({ perfil, chats, tecnicos }) => {
        this.miUuid = (perfil as any).uuid;
        this.chats = chats;

        console.log('Mis chats:', chats);
        console.log('Técnicos:', tecnicos);

        this.tecnicos = (tecnicos as any[]).map((t) => ({
          uuid: t.uuid,
          uuidUsuario: t.uuidUsuario,
          nombre: `${t.nombre ?? ''} ${t.apellido ?? ''}`.trim() || 'Técnico',
        }));

        if (this.chats.length > 0) {
          this.seleccionarChat(this.chats[0]);
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
    this.chatSeleccionado = chat;
    this.chatSeleccionadoEvent.emit(chat);
  }

  // Click en un técnico: abre el chat si ya existe, si no lo crea
  abrirChatCon(tecnico: TecnicoLista): void {
    const existente = this.chats.find(
      (c) => c.uuidTecnico === tecnico.uuid && this.soyElCliente(c),
    );
    if (existente) {
      this.seleccionarChat(existente);
      this.filtroBusqueda = '';
      return;
    }

    this.chatService.iniciarChat(tecnico.uuid).subscribe({
      next: (chatCreado) => {
        console.log('Chat creado:', chatCreado);
        this.chats = [chatCreado, ...this.chats];
        this.seleccionarChat(chatCreado);
        this.filtroBusqueda = '';
      },
      error: (err) => console.error('Error al iniciar el chat:', err),
    });
  }

  get chatsFiltrados(): ChatModel[] {
    const f = this.filtroBusqueda.trim().toLowerCase();
    if (!f) return this.chats;
    return this.chats.filter((c) => this.nombreChat(c).toLowerCase().includes(f));
  }

  // Técnicos con los que todavía no tengo chat (y que no soy yo)
  get tecnicosFiltrados(): TecnicoLista[] {
    const f = this.filtroBusqueda.trim().toLowerCase();
    return this.tecnicos.filter(
      (t) =>
        t.uuidUsuario !== this.miUuid &&
        !this.chats.some((c) => c.uuidTecnico === t.uuid && this.soyElCliente(c)) &&
        (!f || t.nombre.toLowerCase().includes(f)),
    );
  }
}