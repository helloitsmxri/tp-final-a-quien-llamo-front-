
import { CommonModule } from '@angular/common';

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

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
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CrearPresupuesto,
    VerPresupuesto,
    FormTrabajo
  ],
  templateUrl: './detalle-chat.html',
  styleUrl: './detalle-chat.css',
})
export class DetalleChat
  implements OnChanges, OnInit, OnDestroy {

  @Input() chat: ChatModel | null = null;

  @Output() mensajeNuevo = new EventEmitter<string>();

  @ViewChild('areaMensajes')
  private areaMensajesContainer!: ElementRef;

  mensajes: MensajeModel[] = [];
  errorPresupuestos = '';
  avisoTrabajos = '';

  nuevoMensajeTexto = '';

  archivoSeleccionado: File | null = null;

  miUuid = '';

  menuAbierto = false;

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
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.usuarioService.getMyProfile().subscribe({

      next: (perfil) => {
        this.miUuid = perfil.uuid;
      },

      error: (err) => {
        console.error('Error al obtener mi perfil:', err);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['chat'] && this.chat) {

      this.mensajes = [];

      this.archivoSeleccionado = null;
      this.nuevoMensajeTexto = '';

      this.cerrarPanelesPresupuesto();

      this.cargarMensajes(this.chat.uuidChat);

      this.escucharChat(this.chat.uuidChat);
    }
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  get soyElTecnico(): boolean {

    return !!this.chat &&
      !!this.miUuid &&
      this.chat.uuidUsuario !== this.miUuid;
  }

  get uuidOtroUsuario(): string {

    if (!this.chat) return '';

    return this.chat.uuidUsuario === this.miUuid
      ? this.chat.uuidTecnico
      : this.chat.uuidUsuario;
  }

  get nombreOtro(): string {

    if (!this.chat) return 'Contacto';

    const soyElCliente =
      this.chat.uuidUsuario === this.miUuid;

    return (
      soyElCliente
        ? this.chat.nombreTecnico
        : this.chat.nombreUsuario
    ) || 'Contacto';
  }

  esMio(mensaje: MensajeModel): boolean {

    return !!this.miUuid &&
      mensaje.uuidSender === this.miUuid;
  }

  avatar(nombre: string): string {

    return 'https://ui-avatars.com/api/?name='
      + encodeURIComponent(nombre)
      + '&background=eee8ff&color=6c4fe0&bold=true';
  }

  urlArchivo(url: string | null | undefined): string {

    if (!url) return '';

    if (
      url.startsWith('http://') ||
      url.startsWith('https://')
    ) {
      return url;
    }

    return BACKEND + (url.startsWith('/') ? url : '/' + url);
  }

  private escucharChat(uuidChat: string): void {

    this.wsSub?.unsubscribe();

    this.wsSub = this.wsService
      .escucharChat(uuidChat)
      .subscribe((mensaje: MensajeModel) => {

        this.ngZone.run(() => {
          this.agregarMensaje(mensaje);
        });

      });
  }

private agregarMensaje(mensaje: MensajeModel): void {
  if (this.mensajes.some(m => m.uuidMensaje === mensaje.uuidMensaje)) {
    return;
  }

  this.mensajes = [...this.mensajes, mensaje];
  this.mensajeNuevo.emit(mensaje.uuidChat);

  this.cdr.detectChanges();
  this.scrollToBottom();
}


cargarMensajes(uuidChat: string): void {
  this.mensajeService.getByChat(uuidChat).subscribe({
    next: (data) => {
      this.ngZone.run(() => {
        if (this.chat?.uuidChat !== uuidChat) return;

        console.log('Historial recibido del backend:', data);

        if (!Array.isArray(data)) {
          console.error('La respuesta de mensajes no es un array:', data);
          alert('El servidor devolvió un formato de mensajes inesperado.');
          return;
        }

        const ids = new Set(data.map(m => m.uuidMensaje));

        this.mensajes = [
          ...data,
          ...this.mensajes.filter(m => !ids.has(m.uuidMensaje))
        ];

        this.cdr.detectChanges();
        this.scrollToBottom();
      });
    },
    error: (err) => {
      console.error('Error al cargar mensajes:', err);
      this.ngZone.run(() => {
        alert('No se pudieron cargar los mensajes.');
      });
    }
  });
}

  onFileSelected(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      this.archivoSeleccionado = input.files[0];
    }

    input.value = '';
  }

  quitarArchivo(): void {
    this.archivoSeleccionado = null;
  }

  enviarMensaje(): void {
  if (!this.chat) return;

  const texto = this.nuevoMensajeTexto.trim();   
  const archivo = this.archivoSeleccionado;

  if (!texto && !archivo) return;

  const uuidChat = this.chat.uuidChat;

  this.nuevoMensajeTexto = '';                
  this.archivoSeleccionado = null;

  this.mensajeService.store(uuidChat, texto, archivo || undefined).subscribe({
    //                                ^^^^^ la variable local, NO this.nuevoMensajeTexto
    next: (creado) => {
      this.ngZone.run(() => {
        if (this.chat?.uuidChat !== uuidChat) return;
        this.agregarMensaje(creado);
      });
    },
    error: (err) => {
      console.error('Error al enviar mensaje:', err);
      this.ngZone.run(() => {
        if (this.chat?.uuidChat === uuidChat && !this.nuevoMensajeTexto) {
          this.nuevoMensajeTexto = texto;
          this.archivoSeleccionado = archivo;
        }
        alert('No se pudo enviar el mensaje.');
      });
    }
  });
}

  alternarMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  irADenunciar(): void {

    if (!this.chat) return;

    const uuidDenunciado = this.uuidOtroUsuario;

    if (!uuidDenunciado) {

      alert(
        'No se pudo identificar al usuario que querés denunciar.'
      );

      console.error('Chat:', this.chat);

      return;
    }

    this.menuAbierto = false;

    this.router.navigate(['/crear-denuncia'], {
      queryParams: {
        uuidChat: this.chat.uuidChat,
        uuidDenunciado: uuidDenunciado
      }
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

  const uuidChat = this.chat.uuidChat;

  this.menuAbierto = false;
  this.mostrandoCrearPresupuesto = false;
  this.presupuestoSeleccionado = null;
  this.uuidPresupuestoParaTrabajo = null;

  this.mostrandoListaPresupuestos = true;
  this.cargandoPresupuestos = true;
  this.errorPresupuestos = '';
  this.avisoTrabajos = '';
  this.presupuestosDelChat = [];

  let errorAlCargarTrabajos = false;

  forkJoin({
    presupuestos: this.presupuestoService.obtenerPresupuestoChat(uuidChat).pipe(
      catchError((err) => {
        console.error('Error al obtener presupuestos:', err);
        return of(null);
      })
    ),
    trabajos: this.trabajoService.getMyJobs().pipe(
      catchError((err) => {
        console.error('Error al obtener trabajos:', err);
        errorAlCargarTrabajos = true;
        return of([]);
      })
    )
  }).subscribe({
    next: ({ presupuestos, trabajos }) => {
      this.ngZone.run(() => {
        if (this.chat?.uuidChat !== uuidChat) return;

        if (!Array.isArray(presupuestos)) {
          this.errorPresupuestos =
            'No se pudieron cargar los presupuestos de esta conversación.';
          this.cargandoPresupuestos = false;
          this.cdr.detectChanges();
          return;
        }

        console.log('Presupuestos recibidos del backend:', presupuestos);
        console.log('Trabajos recibidos del backend:', trabajos);

        const listaTrabajos = Array.isArray(trabajos) ? trabajos : [];

        const presupuestosFinalizados = new Set(
          listaTrabajos
            .filter(t =>
              String(t.estadoTrabajo).toUpperCase() ===
              String(EstadoTrabajo.Finalizado).toUpperCase()
            )
            .map(t => t.uuidPresupuesto)
        );

        this.presupuestosDelChat = presupuestos.filter(
          p => !presupuestosFinalizados.has(p.uuid)
        );

        if (errorAlCargarTrabajos) {
          this.avisoTrabajos =
            'No se pudo verificar cuáles presupuestos tienen trabajos finalizados. Se muestran los presupuestos igualmente.';
        }

        this.cargandoPresupuestos = false;
        this.cdr.detectChanges();
      });
    },
    error: (err) => {
      console.error('Error inesperado al cargar presupuestos:', err);
      this.ngZone.run(() => {
        this.cargandoPresupuestos = false;
        this.errorPresupuestos =
          'Ocurrió un error al cargar los presupuestos.';
        this.cdr.detectChanges();
      });
    }
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

    alert(
      '¡Trabajo registrado correctamente! Ya podés gestionarlo en "Mis Trabajos".'
    );
  }

  onPresupuestoCreado(nuevo: PresupuestoModel): void {

    this.mostrandoCrearPresupuesto = false;

    const existe = this.presupuestosDelChat.some(
      p => p.uuid === nuevo.uuid
    );

    if (!existe) {
      this.presupuestosDelChat.unshift(nuevo);
    }

    this.presupuestoSeleccionado = nuevo;
  }

  onPresupuestoActualizado(
    actualizado: PresupuestoModel
  ): void {

    const idx = this.presupuestosDelChat.findIndex(
      p => p.uuid === actualizado.uuid
    );

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

      const elemento =
        this.areaMensajesContainer?.nativeElement;

      if (elemento) {
        elemento.scrollTop = elemento.scrollHeight;
      }

    }, 100);
  }
}
