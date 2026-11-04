import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatModel } from '../../models/chat-model';
import { ChatService } from '../../services/chat-service';
import { AuthService } from '../../../auth/services/auth-service';
import { UsuarioService } from '../../../user/services/user';

@Component({
  selector: 'app-lista-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-chat.html',
  styleUrl: './lista-chat.css',
})
export class ListaChat implements OnInit{
  chats: ChatModel[] = [];
  chatSeleccionado: ChatModel | null = null;
  currentUuidUsuario: string = '';
  currentIdUsuario: number = 0;
  filtroBusqueda: string = '';

  // Evento para avisarle al padre (ChatView) qué chat se seleccionó
  @Output() chatSeleccionadoEvent = new EventEmitter<ChatModel>();

  constructor(private chatService: ChatService, private authService:AuthService, private usuarioService:UsuarioService) {}
ngOnInit(): void {
    this.cargarUsuarioYChats();
  }

cargarUsuarioYChats(): void {
    this.usuarioService.getMyProfile().subscribe({
      next: (perfil: any) => {
        if (perfil) {
          this.currentUuidUsuario = perfil.uuid;
          this.currentIdUsuario = perfil.id; 
          this.cargarChats();
        }
      },
      error: (err) => {
        console.error('No se pudo obtener la información del usuario logueado.', err);
      }
    });
  }

  cargarChats(): void {
    if (!this.currentUuidUsuario) return; 

    this.chatService.getByUsuario(this.currentUuidUsuario).subscribe({
      next: (data) => {
        console.log('Chats recibidos del backend:', data);
        this.chats = data;
        if (this.chats.length > 0) {
          this.seleccionarChat(this.chats[0]); // Selecciona el primero por defecto
        }
      },
      error: (err) => console.error('Error al cargar chats:', err)
    });
  }

  // Método temporal para iniciar un chat de prueba con un idTecnico existente en BD
iniciarChatDePrueba(idTecnicoSeleccionado: number): void {
    if (!this.currentUuidUsuario) {
      alert('No se pudo recuperar los datos del usuario autenticado.');
      return;
    }

    this.chatService.iniciarChat(this.currentIdUsuario, idTecnicoSeleccionado).subscribe({
      next: (chatCreado) => {
        alert('¡Chat creado con éxito!');
        if (chatCreado) {
          this.chats.push(chatCreado);
          this.seleccionarChat(chatCreado);
        }
        this.cargarChats();
      },
      error: (err) => {
        console.error('Error al iniciar el chat:', err);
      }
    });
  }
  
  seleccionarChat(chat: ChatModel): void {
    this.chatSeleccionado = chat;
    this.chatSeleccionadoEvent.emit(chat); // Dispara el evento hacia ChatView
  }
  
  get chatsFiltrados(): ChatModel[] {
  if (!this.filtroBusqueda.trim()) {
    return this.chats;
  }
  return this.chats.filter(c => 
    c.nombreTecnico?.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
    c.nombreUsuario?.toLowerCase().includes(this.filtroBusqueda.toLowerCase())
  );
}

}
