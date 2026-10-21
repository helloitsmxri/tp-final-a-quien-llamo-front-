import { Component, OnInit } from '@angular/core';
import { MensajeModel } from '../../models/mensaje-model';
import { MensajeService } from '../../services/mensaje';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-detalle-mensaje',
  styleUrl: './detalle-mensaje.css',
  templateUrl: './detalle-mensaje.html',
})
export class DetalleMensaje implements OnInit{
  mensajes: MensajeModel[] = [];
  nuevoMensajeTexto: string = '';
  archivoSeleccionado: File | null = null;

  currentUuidChat: string = '';
  currentUuidSender: string = '';

  constructor(private mensajeService: MensajeService) {}

  ngOnInit(): void {
    // Aquí puedes asignar los UUIDs dinámicamente o por parámetros de ruta
  }

  enviarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }

  enviarMensaje(): void {
    if (!this.nuevoMensajeTexto.trim() && !this.archivoSeleccionado) {
      return;
    }

    this.mensajeService.store(
      this.currentUuidChat,
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
