import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatModel } from '../../models/chat-model';
import { MensajeModel } from '../../../mensaje/models/mensaje-model';
import { MensajeService } from '../../../mensaje/services/mensaje';
import { AuthService } from '../../../auth/services/auth-service';
import { UsuarioService } from '../../../user/services/user';

@Component({
  selector: 'app-detalle-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-chat.html',
  styleUrl: './detalle-chat.css',
})
export class DetalleChat implements OnChanges, OnInit {

  @Input() chat: ChatModel | null = null;
  @ViewChild('areaMensajes') private areaMensajesContainer!: ElementRef;

  mensajes: MensajeModel[] = [];
  nuevoMensajeTexto: string = '';
  archivoSeleccionado: File | null = null;
  currentUuidSender: string = '8d2d07c7-496b-43bb-be8b-21cf571ed578';

  constructor(private mensajeService: MensajeService, private authService: AuthService, private usuarioService:UsuarioService) {}

  //para utilizar el uuid de la persona que inicie sesión
  ngOnInit(): void {
    this.obtenerUuidEmisor();
  }

  // Se ejecuta cada vez que cambia el @Input() chat
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chat'] && this.chat) {
      this.cargarMensajes(this.chat.uuidChat);
    }
  }

  private obtenerUuidEmisor(): void {
    // Pedimos MI perfil para saber el UUID de quien envía
    this.usuarioService.getMyProfile().subscribe({
      next: (perfil) => {
        if (perfil && perfil.uuid) {
          this.currentUuidSender = perfil.uuid;
        }
      },
      error: (err) => console.error('Error al obtener emisor:', err)
    });
  }

  cargarMensajes(uuidChat: string): void {
    this.mensajeService.getAll().subscribe({
      next: (data) => {
        this.mensajes = data.filter(m => m.uuidChat === uuidChat);
        this.scrollToBottom();
      },
      error: (err) => console.error('Error al cargar mensajes:', err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  enviarMensaje(): void {
    if (!this.chat) return;
    if (!this.nuevoMensajeTexto.trim() && !this.archivoSeleccionado) return;

    this.mensajeService.store(
      this.chat.uuidChat,
      this.currentUuidSender,
      this.nuevoMensajeTexto,
      this.archivoSeleccionado || undefined
    ).subscribe({
      next: (mensajeCreado) => {
        this.mensajes.push(mensajeCreado);
        this.nuevoMensajeTexto = '';
        this.archivoSeleccionado = null;
        this.scrollToBottom();
      },
      error: (err) => console.error('Error al enviar mensaje:', err)
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.areaMensajesContainer) {
        this.areaMensajesContainer.nativeElement.scrollTop = 
          this.areaMensajesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }
}