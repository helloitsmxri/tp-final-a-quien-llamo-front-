import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatModel } from '../../models/chat-model';
import { MensajeModel } from '../../../mensaje/models/mensaje-model';
import { MensajeService } from '../../../mensaje/services/mensaje';
import { UsuarioService } from '../../../user/services/user';
import { WebSocketService } from '../../services/web-socket-service';
import { PresupuestoService } from '../../../presupuesto/services/presupuesto';
import { PresupuestoModel } from '../../../presupuesto/models/presupuesto-model';
import { CrearPresupuesto } from '../../../presupuesto/pages/crear-presupuesto/crear-presupuesto';
import { VerPresupuesto } from '../../../presupuesto/pages/ver-presupuesto/ver-presupuesto';

const BACKEND = 'http://localhost:8080';
@Component({
  selector: 'app-detalle-chat',
  imports: [CommonModule, FormsModule, CrearPresupuesto, VerPresupuesto],
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
  menuAbierto = false;
  mostrarDenuncia = false;

  // Presupuestos
  mostrarCrearPresupuesto = false;
  mostrarListaPresupuestos = false;
  presupuestosChat: PresupuestoModel[] = [];
  presupuestoSeleccionado: PresupuestoModel | null = null;
  cargandoPresupuestos = false;

  private wsSub?: Subscription;

  constructor(
    private mensajeService: MensajeService,
    private usuarioService: UsuarioService,
    private wsService: WebSocketService,
    private ngZone: NgZone,
    private presupuestoService: PresupuestoService,
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
      // Si cambio de chat, cierro el menú y cualquier ventana de presupuesto abierta
      this.menuAbierto = false;
      this.mostrarCrearPresupuesto = false;
      this.mostrarListaPresupuestos = false;
      this.presupuestoSeleccionado = null;

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

  // En este chat, ¿yo soy el técnico? (si no soy el cliente, soy el técnico)
  get soyElTecnico(): boolean {
    return !!this.chat && !!this.miUuid && this.chat.uuidUsuario !== this.miUuid;
  }

  // Convierte la ruta del archivo (/uploads/...) en una URL completa hacia el backend
  urlArchivo(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return BACKEND + (url.startsWith('/') ? url : '/' + url);
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

  // ---------- MENÚ DESPLEGABLE (⋮) ----------

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  // Si hago clic fuera del menú, se cierra
  @HostListener('document:click', ['$event'])
  cerrarMenuAlHacerClicAfuera(event: MouseEvent): void {
    const objetivo = event.target as HTMLElement;
    if (!objetivo.closest('.menu-acciones')) {
      this.menuAbierto = false;
    }
  }

  // Con la tecla Escape también se cierra
  @HostListener('document:keydown.escape')
  cerrarMenuConEscape(): void {
    this.menuAbierto = false;
  }

  // ---------- PRESUPUESTOS ----------

  abrirCrearPresupuesto(): void {
    this.menuAbierto = false;
    this.mostrarCrearPresupuesto = true;
  }

  cerrarCrearPresupuesto(): void {
    this.mostrarCrearPresupuesto = false;
  }

  // Se creó el presupuesto: cierro el formulario y recargo mensajes
  // (el back dejó un mensaje automático en el chat)
  alCrearPresupuesto(): void {
    this.mostrarCrearPresupuesto = false;
    if (this.chat) this.cargarMensajes(this.chat.uuidChat);
  }

  abrirPresupuestos(): void {
    this.menuAbierto = false;
    if (!this.chat) return;

    this.mostrarListaPresupuestos = true;
    this.presupuestoSeleccionado = null;
    this.cargandoPresupuestos = true;

    this.presupuestoService.obtenerPresupuestoChat(this.chat.uuidChat).subscribe({
      next: (lista) => {
        this.presupuestosChat = lista;
        this.cargandoPresupuestos = false;
      },
      error: (err) => {
        console.error('Error al cargar presupuestos:', err);
        this.cargandoPresupuestos = false;
      },
    });
  }

  cerrarPresupuestos(): void {
    this.mostrarListaPresupuestos = false;
    this.presupuestoSeleccionado = null;
  }

  verPresupuesto(p: PresupuestoModel): void {
    this.presupuestoSeleccionado = p;
  }

  volverALista(): void {
    this.presupuestoSeleccionado = null;
  }

  // Aceptar, rechazar y cancelar dejan un mensaje automático: recargo mensajes
  alActualizarPresupuesto(): void {
    if (this.chat) this.cargarMensajes(this.chat.uuidChat);
  }

    // ---------- DENUNCIA ----------

  abrirDenuncia(): void {
    this.menuAbierto = false;
    this.mostrarDenuncia = true;
  }

  cerrarDenuncia(): void {
    this.mostrarDenuncia = false;
  }

  alCrearDenuncia(): void {
    this.mostrarDenuncia = false;
  }
  
  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.areaMensajesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }
}