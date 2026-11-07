import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatModel } from '../../models/chat-model';
import { MensajeModel } from '../../../mensaje/models/mensaje-model';
import { MensajeService } from '../../../mensaje/services/mensaje';
import { UsuarioService } from '../../../user/services/user';
import { WebSocketService } from '../../services/web-socket-service';

@Component({
  selector: 'app-detalle-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-chat.html',
  styleUrl: './detalle-chat.css',
})
export class DetalleChat implements OnChanges, OnInit, OnDestroy {
  @Input() chat: ChatModel | null = null;

  // Avisa cada vez que aparece un mensaje en este chat (enviado o recibido)
  @Output() mensajeNuevo = new EventEmitter<string>();

  @ViewChild('areaMensajes') private areaMensajesContainer!: ElementRef;

  mensajes: MensajeModel[] = [];
  nuevoMensajeTexto = '';
  archivoSeleccionado: File | null = null;
  miUuid = '';

  private wsSub?: Subscription;

  constructor(
    private mensajeService: MensajeService,
    private usuarioService: UsuarioService,
    private wsService: WebSocketService,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.usuarioService.getMyProfile().subscribe({
      next: (perfil) => (this.miUuid = perfil.uuid),
      error: (err) => console.error('Error al obtener mi perfil:', err),
    });
  }

  // Se ejecuta cada vez que cambia el chat seleccionado
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chat'] && this.chat) {
      this.mensajes = [];
      this.cargarMensajes(this.chat.uuidChat);
      this.escucharChat(this.chat.uuidChat);
    }
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  esMio(m: MensajeModel): boolean {
    return !!this.miUuid && m.uuidSender === this.miUuid;
  }

  // Nombre de la OTRA persona del chat
  get nombreOtro(): string {
    if (!this.chat) return 'Contacto';
    const soyElCliente = this.chat.uuidUsuario === this.miUuid;
    return (soyElCliente ? this.chat.nombreTecnico : this.chat.nombreUsuario) || 'Contacto';
  }

  avatar(nombre: string): string {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nombre) + '&background=random';
  }

  private escucharChat(uuidChat: string): void {
    this.wsSub?.unsubscribe(); // corta la suscripción del chat anterior
    this.wsSub = this.wsService.escucharChat(uuidChat).subscribe((m: MensajeModel) =>
      this.ngZone.run(() => this.agregarMensaje(m)),
    );
  }

  // Evita duplicados: el mismo mensaje puede llegar por REST y por WebSocket
  private agregarMensaje(m: MensajeModel): void {
    if (this.mensajes.some((x) => x.uuidMensaje === m.uuidMensaje)) return;
    this.mensajes.push(m);
    this.mensajeNuevo.emit(m.uuidChat);
    this.scrollToBottom();
  }

  cargarMensajes(uuidChat: string): void {
    this.mensajeService.getByChat(uuidChat).subscribe({
      next: (data) => {
        if (this.chat?.uuidChat !== uuidChat) return; // cambié de chat mientras cargaba
        // Junto lo cargado con lo que haya llegado por WebSocket mientras tanto
        const ids = new Set(data.map((m) => m.uuidMensaje));
        this.mensajes = [...data, ...this.mensajes.filter((m) => !ids.has(m.uuidMensaje))];
        this.scrollToBottom();
      },
      error: (err) => console.error('Error al cargar mensajes:', err),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.archivoSeleccionado = input.files[0];
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  quitarArchivo(): void {
    this.archivoSeleccionado = null;
  }

  enviarMensaje(): void {
    if (!this.chat) return;
    if (!this.nuevoMensajeTexto.trim() && !this.archivoSeleccionado) return;

    this.mensajeService
      .store(this.chat.uuidChat, this.nuevoMensajeTexto.trim(), this.archivoSeleccionado || undefined)
      .subscribe({
        next: (creado) => {
          console.log('Mensaje guardado:', creado);
          this.agregarMensaje(creado);
          this.nuevoMensajeTexto = '';
          this.archivoSeleccionado = null;
        },
        error: (err) => console.error('Error al enviar mensaje:', err),
      });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.areaMensajesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }
}