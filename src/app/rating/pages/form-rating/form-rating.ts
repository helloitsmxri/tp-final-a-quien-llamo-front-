import { Component, EventEmitter, inject, Input, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { RatingService } from '../../services/rating';
import { UsuarioService } from '../../../user/services/user';
import { TrabajoService } from '../../../trabajo/services/trabajo';
import { TrabajoModel } from '../../../trabajo/models/trabajo-model';
import { CaracteristicaService } from '../../../caracteristica/services/caracteristica';
import { RatingModel } from '../../models/rating-model';

interface TrabajoCalificable {
  uuidTrabajo: string;
  etiqueta: string;
  esClienteElDestinatario: boolean;
}

@Component({
  selector: 'app-form-rating',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-rating.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './form-rating.css',
})
export class FormRating implements OnInit {
  private rService = inject(RatingService);
  private usuarioService = inject(UsuarioService);
  private trabajoService = inject(TrabajoService);
  private caracteristicaService = inject(CaracteristicaService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @Input() uuidTrabajoPreset: string = '';
  @Input() nombreTrabajoPreset: string = '';
  @Output() ratingCreado = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  uuidTrabajo = new FormControl('', [Validators.required]);
  valoracion = new FormControl(5, [
    Validators.required,
    Validators.min(1),
    Validators.max(5)
  ]);
  descripcion = new FormControl('', [Validators.maxLength(2000)]);
  tipoFoto = new FormControl<string | null>(null);
  foto = new FormControl<string | null>(null);
  uuidCaracteristicas = new FormControl<string[]>([], [Validators.required]);

  formulario = new FormGroup({
    uuidTrabajo: this.uuidTrabajo,
    valoracion: this.valoracion,
    descripcion: this.descripcion,
    tipoFoto: this.tipoFoto,
    foto: this.foto,
    uuidCaracteristicas: this.uuidCaracteristicas
  });

  trabajosDisponibles: TrabajoCalificable[] = [];
  caracteristicasDisponibles: any[] = [];
  trabajoFijoLabel = '';
  calificandoACliente = false;
  cargandoTrabajos = false;
  cargandoCaracteristicas = true;
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
    const paramUuidTrabajo =
      this.uuidTrabajoPreset ||
      this.route.snapshot.queryParamMap.get('uuidTrabajo') ||
      '';

    const paramNombreTrabajo =
      this.nombreTrabajoPreset ||
      this.route.snapshot.queryParamMap.get('nombreTrabajo') ||
      '';

    if (paramUuidTrabajo) {
      this.uuidTrabajo.setValue(paramUuidTrabajo);
      this.trabajoFijoLabel = paramNombreTrabajo || 'Trabajo seleccionado';
    }

    // Actualizar textos dinámicamente cuando cambia el trabajo en el select
    this.uuidTrabajo.valueChanges.subscribe((uuidSeleccionado) => {
      const encontrado = this.trabajosDisponibles.find(
        (t) => t.uuidTrabajo === uuidSeleccionado
      );
      if (encontrado) {
        this.calificandoACliente = encontrado.esClienteElDestinatario;
      }
    });

    // Cargar características disponibles desde el backend
    this.caracteristicaService.getAll().subscribe({
      next: (lista) => {
        this.caracteristicasDisponibles = lista;
        this.cargandoCaracteristicas = false;
      },
      error: (err) => {
        console.error('Error al cargar características:', err);
        this.cargandoCaracteristicas = false;
      }
    });

    // Obtener perfil para saber si en cada trabajo soy cliente o técnico
    this.usuarioService.getMyProfile().subscribe({
      next: (perfil) => {
        this.cargarMisTrabajos(perfil.uuid, paramUuidTrabajo);
      },
      error: (err) => console.error('Error al obtener perfil:', err)
    });
  }

  private cargarMisTrabajos(miUuid: string, uuidPreset: string): void {
    this.cargandoTrabajos = true;

    this.trabajoService.getMyJobs().subscribe({
      next: (trabajos: TrabajoModel[]) => {
        const finalizados = trabajos.filter(
          (t) => String(t.estadoTrabajo).toUpperCase() === 'FINALIZADO'
        );

        this.trabajosDisponibles = finalizados.map((t) => {
          const soyElCliente = t.uuidCliente === miUuid;
          const otraPersona = soyElCliente
            ? `${t.nombreTecnico} ${t.apellidoTecnico}`.trim()
            : `${t.nombreCliente} ${t.apellidoCliente}`.trim();
          const rolOtro = soyElCliente ? 'Técnico' : 'Cliente';

          return {
            uuidTrabajo: t.uuid,
            etiqueta: `${t.nombreProyecto} — ${otraPersona} (${rolOtro})`,
            esClienteElDestinatario: !soyElCliente
          };
        });

        // Si vino preseleccionado por queryParam, sincronizamos el rol y la etiqueta completa
        if (uuidPreset) {
          const preset = this.trabajosDisponibles.find(
            (t) => t.uuidTrabajo === uuidPreset
          );
          if (preset) {
            this.calificandoACliente = preset.esClienteElDestinatario;
            this.trabajoFijoLabel = preset.etiqueta;
          }
        } else if (this.trabajosDisponibles.length > 0) {
          // Seleccionar automáticamente el primero para que los textos ya arranquen bien
          const primero = this.trabajosDisponibles[0];
          this.uuidTrabajo.setValue(primero.uuidTrabajo);
          this.calificandoACliente = primero.esClienteElDestinatario;
        }

        this.cargandoTrabajos = false;
      },
      error: (err) => {
        console.error('Error al cargar trabajos:', err);
        this.cargandoTrabajos = false;
      }
    });
  }

  seleccionarEstrellas(puntaje: number): void {
    this.valoracion.setValue(puntaje);
    this.valoracion.markAsTouched();
  }

  toggleCaracteristica(uuid: string): void {
    const actuales: string[] = [...(this.uuidCaracteristicas.value || [])];
    const index = actuales.indexOf(uuid);

    if (index >= 0) {
      actuales.splice(index, 1);
    } else {
      actuales.push(uuid);
    }

    this.uuidCaracteristicas.setValue(actuales);
    this.uuidCaracteristicas.markAsTouched();
  }

  estaSeleccionada(uuid: string): boolean {
    return (this.uuidCaracteristicas.value || []).includes(uuid);
  }

  registrar(): void {
    if (this.formulario.invalid || this.enviando) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando = true;
    const raw = this.formulario.getRawValue();

    const rating: RatingModel = {
      uuidTrabajo: raw.uuidTrabajo!,
      valoracion: raw.valoracion!,
      descripcion: raw.descripcion?.trim() || undefined,
      tipoFoto: raw.tipoFoto || undefined,
      foto: raw.foto || null,
      uuidCaracteristicas: raw.uuidCaracteristicas || []
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
        const msg = e?.error?.mensaje || 'No se pudo publicar la reseña. Verificá los datos.';
        alert(msg);
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