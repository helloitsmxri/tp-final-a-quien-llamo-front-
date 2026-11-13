import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { RatingService } from '../../services/rating';
import { UsuarioService } from '../../../user/services/user';
import { ChatModel } from '../../../chat/models/chat-model';
import { RatingModel } from '../../models/rating-model';
import { ChatService } from '../../../chat/services/chat-service';

interface ContactoCalificable {
  uuid: string;
  nombreCompleto: string;
}

@Component({
  selector: 'app-form-rating',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-rating.html',
  styleUrl: './form-rating.css',
})
export class FormRating implements OnInit {
  private rService = inject(RatingService);
  private usuarioService = inject(UsuarioService);
  private chatService = inject(ChatService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @Input() uuidDestinatarioPreset: string = '';
  @Input() nombreDestinatarioPreset: string = '';
  @Output() ratingCreado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  uuidRemitente = new FormControl('', [Validators.required]);
  uuidDestinatario = new FormControl('', [Validators.required]);
  valoracion = new FormControl(5, [
    Validators.required,
    Validators.min(1),
    Validators.max(5)
  ]);
  descripcion = new FormControl('', [Validators.maxLength(500)]);
  tipoFoto = new FormControl<string | null>(null);
  foto = new FormControl<string | null>(null);
  caracteristicas = new FormControl<string[]>([], [Validators.required]);

  formulario = new FormGroup({
    uuidRemitente: this.uuidRemitente,
    uuidDestinatario: this.uuidDestinatario,
    valoracion: this.valoracion,
    descripcion: this.descripcion,
    tipoFoto: this.tipoFoto,
    foto: this.foto,
    caracteristicas: this.caracteristicas
  });

  contactosDisponibles: ContactoCalificable[] = [];
  nombreFijo = '';
  cargandoContactos = false;
  enviando = false;
  estrellasOpciones = [1, 2, 3, 4, 5];

  etiquetasEstrellas: Record<number, string> = {
    1: '1 - Muy mala',
    2: '2 - Mala',
    3: '3 - Regular',
    4: '4 - Buena',
    5: '5 - Excelente'
  };

  ngOnInit(): void {
    const paramUuid =
      this.uuidDestinatarioPreset ||
      this.route.snapshot.queryParamMap.get('uuidDestinatario') ||
      '';

    const paramNombre =
      this.nombreDestinatarioPreset ||
      this.route.snapshot.queryParamMap.get('nombreDestinatario') ||
      '';

    if (paramUuid) {
      this.uuidDestinatario.setValue(paramUuid);
      this.nombreFijo = paramNombre || 'Usuario seleccionado';
    }

    this.usuarioService.getMyProfile().subscribe({
      next: (perfil) => {
        this.uuidRemitente.setValue(perfil.uuid);
        if (!paramUuid) {
          this.cargarContactosDesdeChats(perfil.uuid);
        }
      },
      error: (err) => console.error('Error al obtener perfil del usuario:', err)
    });
  }

  private cargarContactosDesdeChats(miUuid: string): void {
    this.cargandoContactos = true;

    this.chatService.getMisChats().subscribe({
      next: (chats: ChatModel[]) => {
        const mapa = new Map<string, ContactoCalificable>();

        for (const c of chats) {
          const soyElCliente = c.uuidUsuario === miUuid;
          const uuidOtraPersona = soyElCliente ? c.uuidTecnico : c.uuidUsuario;
          const nombreOtraPersona = soyElCliente ? c.nombreTecnico : c.nombreUsuario;

          if (uuidOtraPersona && uuidOtraPersona !== miUuid && !mapa.has(uuidOtraPersona)) {
            mapa.set(uuidOtraPersona, {
              uuid: uuidOtraPersona,
              nombreCompleto: nombreOtraPersona || 'Usuario'
            });
          }
        }

        this.contactosDisponibles = Array.from(mapa.values());
        this.cargandoContactos = false;
      },
      error: (err) => {
        console.error('Error al cargar contactos de chats:', err);
        this.cargandoContactos = false;
      }
    });
  }

  seleccionarEstrellas(puntaje: number): void {
    this.valoracion.setValue(puntaje);
    this.valoracion.markAsTouched();
  }

  agregarCaracteristicas(texto: string): void {
    const nuevas = texto
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    if (nuevas.length === 0) return;

    const actuales: string[] = this.caracteristicas.value || [];
    this.caracteristicas.setValue(Array.from(new Set([...actuales, ...nuevas])));
    this.caracteristicas.markAsTouched();
  }

  eliminarCaracteristica(index: number): void {
    const actuales: string[] = [...(this.caracteristicas.value || [])];
    actuales.splice(index, 1);
    this.caracteristicas.setValue(actuales);
    this.caracteristicas.markAsTouched();
  }

  registrar(): void {
    if (this.formulario.invalid || this.enviando) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando = true;
    const raw = this.formulario.getRawValue();

    const rating: RatingModel = {
      uuidRemitente: raw.uuidRemitente!,
      uuidDestinatario: raw.uuidDestinatario!,
      valoracion: raw.valoracion!,
      descripcion: raw.descripcion?.trim() || undefined,
      tipoFoto: raw.tipoFoto ?? '',
      foto: raw.foto || null,
      uuidCaracteristicas: raw.caracteristicas || []
    };

    this.rService.createRating(rating).subscribe({
      next: () => {
        this.enviando = false;
        alert('¡Reseña publicada con éxito!');
        if (this.ratingCreado.observed) {
          this.ratingCreado.emit();
        } else {
          this.router.navigate(['/mis-resenas']);
        }
      },
      error: (e) => {
        this.enviando = false;
        console.error('Error al registrar la calificación:', e);
        alert('No se pudo publicar la reseña. Verificá los datos e intentá nuevamente.');
      }
    });
  }

  cancelar(): void {
    if (this.cerrar.observed) {
      this.cerrar.emit();
    } else {
      this.router.navigate(['/mis-resenas']);
    }
  }
}