import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatModel } from '../../models/chat-model';
import { ChatService } from '../../services/chat-service';
import { AuthService } from '../../../auth/services/auth-service';
import { UsuarioService } from '../../../user/services/user';
import { TecnicoModel } from '../../../tecnico/models/tecnico-model';
import { TecnicoService } from '../../../tecnico/services/tecnico';

@Component({
  selector: 'app-lista-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-chat.html',
  styleUrl: './lista-chat.css',
})
export class ListaChat implements OnInit{
  chats: ChatModel[] = [];
  tecnicos: TecnicoModel[] = [];
  chatSeleccionado: ChatModel | null = null;
  filtroBusqueda: string = '';

  private uuidUsuario = '';
  private idUsuario=0;

  // Evento para avisarle al padre (ChatView) qué chat se seleccionó
  @Output() chatSeleccionadoEvent = new EventEmitter<ChatModel>();

  constructor(private chatService: ChatService, 
    private usuarioService:UsuarioService,
  private tecnicoService:TecnicoService) {}

ngOnInit(): void {
    this.usuarioService.getMyProfile().subscribe({
      next: (perfil: any) => {
        this.uuidUsuario = perfil.uuid;
         this.uuidUsuario = perfil.uuid;
        this.idUsuario = perfil.id;
        this.cargarChats();
      },
      error: (err) => console.error('No se pudo obtener el usuario logueado.', err),
    });

    this.tecnicoService.getTecnicos().subscribe({
      next: (data) => (this.tecnicos = data),
      error: (err) => console.error('Error al cargar técnicos:', err),
    });
  }

  cargarChats(): void {
    this.chatService.getByUsuario(this.uuidUsuario).subscribe({
      next: (data) => {
        this.chats = data;
        if (!this.chatSeleccionado && data.length > 0) {
          this.seleccionarChat(data[0]);
        }
      },
      error: (err) => console.error('Error al cargar chats:', err),
    });
  }

  seleccionarChat(chat: ChatModel): void {
    this.chatSeleccionado = chat;
    this.chatSeleccionadoEvent.emit(chat);
  }

  // Click en un técnico: abre el chat si existe, si no lo crea
  abrirChatCon(tecnico: TecnicoModel): void {
    const existente = this.chats.find((c) => c.idTecnico === tecnico.idTecnico);
    if (existente) {
      this.seleccionarChat(existente);
      this.filtroBusqueda = '';
      return;
    }

    this.chatService.iniciarChat(this.idUsuario, tecnico.idTecnico).subscribe({
      next: (chatCreado) => {
        this.chats.unshift(chatCreado);
        this.seleccionarChat(chatCreado);
        this.filtroBusqueda = '';
      },
      error: (err) => console.error('Error al iniciar el chat:', err),
    });
  }

  get chatsFiltrados(): ChatModel[] {
    const f = this.filtroBusqueda.trim().toLowerCase();
    if (!f) return this.chats;
    return this.chats.filter((c) =>
      (c.nombreTecnico ?? '').toLowerCase().includes(f) ||
      (c.nombreUsuario ?? '').toLowerCase().includes(f),
    );
  }

  // Técnicos que coinciden con la búsqueda y con los que todavía no hay chat
  get tecnicosFiltrados(): TecnicoModel[] {
    const f = this.filtroBusqueda.trim().toLowerCase();
    if (!f) return [];
    return this.tecnicos.filter(
      (t) =>
        t.usuario.nombre.toLowerCase().includes(f) &&
        !this.chats.some((c) => c.idTecnico === t.idTecnico),
    );
  }
}
