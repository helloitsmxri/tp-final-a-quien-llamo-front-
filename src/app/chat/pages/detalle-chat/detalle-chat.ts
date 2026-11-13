import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChatModel } from '../../models/chat-model';
import { MensajeModel } from '../../../mensaje/models/mensaje-model';
import { MensajeService } from '../../../mensaje/services/mensaje';
import { UsuarioService } from '../../../user/services/user';
import { WebSocketService } from '../../services/web-socket-service';
import { CrearPresupuesto } from '../../../presupuesto/pages/crear-presupuesto/crear-presupuesto';
import { VerPresupuesto } from '../../../presupuesto/pages/ver-presupuesto/ver-presupuesto';
import { FormTrabajo } from '../../../trabajo/pages/form-trabajo/form-trabajo';
import { PresupuestoService } from '../../../presupuesto/services/presupuesto';
import { PresupuestoModel } from '../../../presupuesto/models/presupuesto-model';
import { EstadoPresupuesto } from '../../../presupuesto/enum/estado-presupuesto';
import { TrabajoService } from '../../../trabajo/services/trabajo';
import { EstadoTrabajo } from '../../../trabajo/enum/estado-trabajo';

const BACKEND = 'http://localhost:8080';

@Component({
  selector: 'app-detalle-chat',
  imports: [CommonModule, FormsModule, RouterModule, CrearPresupuesto, VerPresupuesto, FormTrabajo],
  templateUrl: './detalle-chat.html',
  styleUrl: './detalle-chat.css',
})
export class DetalleChat implements OnChanges, OnInit, OnDestroy {
  @Input() chat: ChatModel | null = null;
  @Output() mensajeNuevo = new EventEmitter<string>();

  @ViewChild('areaMensajes') private areaMensajesContainer!: ElementRef;

  mensajes: MensajeModel[] = [];
  nuevoMensajeTexto = '';
  archivoSeleccionado: File | null = null;
  miUuid = '';
  menuAbierto = false;

  // Variables para mostrar los modales de presupuesto y trabajo
  mostrandoCrearPresupuesto = false;
  mostrandoListaPresupuestos = false;
  presupuestosDelChat: PresupuestoModel[] = [];
  presupuestoSeleccionado: PresupuestoModel | null = null;
  uuidPresupuestoParaTrabajo: string | null = null;
  cargandoPresupuestos = false;
  EstadoPresupuesto = EstadoPresupuesto;

  private wsSub?: Subscription;

  constructor(
    private mensajeService: MensajeService,
    private usuarioService: UsuarioService,
    private wsService: WebSocketService,
    private presupuestoService: PresupuestoService,
    private trabajoService: TrabajoService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.usuarioService.getMyProfile().subscribe({
      next: (perfil) => (this.miUuid = perfil.uuid),
      error: (err) => console.error('Error al obtener mi perfil:', err),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chat'] && this.chat) {
      this.mensajes = [];
      this.cerrarPanelesPresupuesto();
      this.cargarMensajes(this.chat.uuidChat);
      this.escucharChat(this.chat.uuidChat);
    }
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  get soyElTecnico(): boolean {
    return !!this.chat && !!this.miUuid && this.chat.uuidUsuario !== this.miUuid;
  }

  esMio(m: MensajeModel): boolean {
    return !!this.miUuid && m.uuidSender === this.miUuid;
  }

  urlArchivo(url: string | null | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return BACKEND + (url.startsWith('/') ? url : '/' + url);
  }

  get nombreOtro(): string {
    if (!this.chat) return 'Contacto';
    const soyElCliente = this.chat.uuidUsuario === this.miUuid;
    return (soyElCliente ? this.chat.nombreTecnico : this.chat.nombreUsuario) || 'Contacto';
  }

  avatar(nombre: string): string {
    return 'https://ui-avatars.com/api/?name=' + encodeURIComponent(nombre) + '&background=random';
  }

  private escucharChat(uuidChat: string): void {
    this.wsSub?.unsubscribe();
    this.wsSub = this.wsService.escucharChat(uuidChat).subscribe((m: MensajeModel) =>
      this.ngZone.run(() => this.agregarMensaje(m)),
    );
  }

  private agregarMensaje(m: MensajeModel): void {
    if (this.mensajes.some((x) => x.uuidMensaje === m.uuidMensaje)) return;
    this.mensajes.push(m);
    this.mensajeNuevo.emit(m.uuidChat);
    this.scrollToBottom();
  }

  cargarMensajes(uuidChat: string): void {
    this.mensajeService.getByChat(uuidChat).subscribe({
      next: (data) => {
        if (this.chat?.uuidChat !== uuidChat) return;
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
    input.value = '';
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
          this.agregarMensaje(creado);
          this.nuevoMensajeTexto = '';
          this.archivoSeleccionado = null;
        },
        error: (err) => console.error('Error al enviar mensaje:', err),
      });
  }

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  get uuidOtroUsuario(): string {
    if (!this.chat) return '';
    return this.chat.uuidUsuario === this.miUuid
      ? (this.chat as any).uuidTecnico || (this.chat as any).uuidUsuarioTecnico || ''
      : this.chat.uuidUsuario;
  }

  irADenunciar(): void {
    if (!this.chat) return;
    this.menuAbierto = false;

    this.router.navigate(['/denuncias/nueva'], {
      queryParams: {
        uuidChat: this.chat.uuidChat,
        uuidDenunciado: this.uuidOtroUsuario,
      },
    });
  }

  abrirCrearPresupuesto(): void {
    this.menuAbierto = false;
    this.mostrandoListaPresupuestos = false;
    this.presupuestoSeleccionado = null;
    this.uuidPresupuestoParaTrabajo = null;
    this.mostrandoCrearPresupuesto = true;
  }

  abrirVerPresupuestos(): void {
    if (!this.chat) return;
    this.menuAbierto = false;
    this.mostrandoCrearPresupuesto = false;
    this.presupuestoSeleccionado = null;
    this.uuidPresupuestoParaTrabajo = null;
    this.mostrandoListaPresupuestos = true;
    this.cargandoPresupuestos = true;

    forkJoin({
      presupuestos: this.presupuestoService.obtenerPresupuestoChat(this.chat.uuidChat),
      trabajos: this.trabajoService.getMyJobs().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ presupuestos, trabajos }) => {
        const presupuestosFinalizados = new Set(
          trabajos
            .filter((t) => String(t.estadoTrabajo).toUpperCase() === EstadoTrabajo.Finalizado.toUpperCase())
            .map((t) => t.uuidPresupuesto)
        );

        this.presupuestosDelChat = presupuestos.filter(
          (p) => !presupuestosFinalizados.has(p.uuid)
        );
        this.cargandoPresupuestos = false;
      },
      error: (err) => {
        console.error('Error al cargar presupuestos del chat:', err);
        this.cargandoPresupuestos = false;
      },
    });
  }

  seleccionarPresupuesto(p: PresupuestoModel): void {
    this.presupuestoSeleccionado = p;
  }

  abrirRegistrarTrabajo(uuidPresupuesto: string): void {
    this.mostrandoListaPresupuestos = false;
    this.presupuestoSeleccionado = null;
    this.uuidPresupuestoParaTrabajo = uuidPresupuesto;
  }

  onTrabajoCreado(): void {
    this.cerrarPanelesPresupuesto();
    alert('¡Trabajo registrado correctamente! Ya podés gestionarlo en "Mis Trabajos".');
  }

  onPresupuestoCreado(nuevo: PresupuestoModel): void {
    this.mostrandoCrearPresupuesto = false;

    const existe = this.presupuestosDelChat.some(
      (p) => p.uuid === nuevo.uuid
    );

    if (!existe) {
      this.presupuestosDelChat.unshift(nuevo);
    }

    this.presupuestoSeleccionado = nuevo;
  }

  onPresupuestoActualizado(actualizado: PresupuestoModel): void {
    const idx = this.presupuestosDelChat.findIndex((p) => p.uuid === actualizado.uuid);
    if (idx !== -1) {
      this.presupuestosDelChat[idx] = actualizado;
    }
  }

  cerrarPanelesPresupuesto(): void {
    this.menuAbierto = false;
    this.mostrandoCrearPresupuesto = false;
    this.mostrandoListaPresupuestos = false;
    this.presupuestoSeleccionado = null;
    this.uuidPresupuestoParaTrabajo = null;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.areaMensajesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 100);
  }
}