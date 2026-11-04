import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatModel } from '../../models/chat-model';
import { MensajeModel } from '../../../mensaje/models/mensaje-model';
import { MensajeService } from '../../../mensaje/services/mensaje';
import { AuthService } from '../../../auth/services/auth-service';

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

  constructor(private mensajeService: MensajeService, private authService: AuthService) {}

  //para utilizar el uuid de la persona que inicie sesión
  ngOnInit(): void {
    const uuid = this.authService.getUuidUsuarioLogueado();
    if (uuid && !uuid.includes('@')) {
      this.currentUuidSender = uuid;
    }
  }

  // Se ejecuta cada vez que cambia el @Input() chat
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chat'] && this.chat) {
      this.cargarMensajes(this.chat.uuidChat);
    }
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