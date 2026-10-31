import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatModel } from '../../models/chat-model';
import { MensajeModel } from '../../../mensaje/models/mensaje-model';
import { MensajeService } from '../../../mensaje/services/mensaje';

@Component({
  selector: 'app-detalle-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-chat.html',
  styleUrl: './detalle-chat.css',
})
export class DetalleChat implements OnChanges {

  @Input() chat: ChatModel | null = null;

  mensajes: MensajeModel[] = [];
  nuevoMensajeTexto: string = '';
  archivoSeleccionado: File | null = null;
  currentUuidSender: string = '729c5bdf-7f18-4beb-926e-1e808951c220';

  constructor(private mensajeService: MensajeService) {}

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
      },
      error: (err) => console.error('Error al enviar mensaje:', err)
    });
  }
}
