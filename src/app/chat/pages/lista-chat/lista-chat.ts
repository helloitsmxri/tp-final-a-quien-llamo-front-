import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatModel } from '../../models/chat-model';
import { ChatService } from '../../services/chat-service';
import { AuthService } from '../../../auth/services/auth-service';

@Component({
  selector: 'app-lista-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-chat.html',
  styleUrl: './lista-chat.css',
})
export class ListaChat implements OnInit{
  chats: ChatModel[] = [];
  chatSeleccionado: ChatModel | null = null;
  currentUuidUsuario: string = '8d2d07c7-496b-43bb-be8b-21cf571ed578';
  filtroBusqueda: string = '';

  // Evento para avisarle al padre (ChatView) qué chat se seleccionó
  @Output() chatSeleccionadoEvent = new EventEmitter<ChatModel>();

  constructor(private chatService: ChatService, private authService:AuthService) {}

  ngOnInit(): void {

    //obtenemos el uuid del usuario logueado dinámicamente.
    const uuid = this.authService.getUuidUsuarioLogueado();
    
    if (uuid && !uuid.includes('@')) {
      this.currentUuidUsuario = uuid;
      this.cargarChats();
    } else {
      console.warn('No hay un usuario autenticado para cargar sus chats.');
    }

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
iniciarChatDePrueba(): void {
  
  const requestBody = {
    idUsuario: 2,
    idTecnico: 1   
  };

  console.log('Enviando DTO al backend:', requestBody);

  this.chatService.iniciarChat(requestBody).subscribe({
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
      alert('Revisá que los IDs 1 y 2 existan en tu base de datos MySQL.');
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
