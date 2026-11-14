
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { EspecialidadModel } from '../../../especialidad/models/especialidad-model';
import { FormPortfolio } from '../../../portfolio/pages/form-portfolio/form-portfolio';
import { CertificacionForm } from '../../../certificacion/pages/certificacion-form/certificacion-form';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TecnicoService } from '../../services/tecnico';
import { TipoValidacion } from '../../../especialidad/enum/tipo-validacion';
import { PerfilTecnicoModel } from '../../models/PerfilTecnicoModel';
import { contieneLetras } from '../../../utils/validadores-texto';
import { SelectorServicios } from '../../../selector-servicios/selector-servicios';

type Pendiente = {
  especialidad: EspecialidadModel;
  opciones: { uuid: string; nombre: string }[];
};

@Component({
  selector: 'app-editar-tecnico',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SelectorServicios,
    CertificacionForm,
    FormPortfolio
  ],
  templateUrl: './editar-tecnico.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './editar-tecnico.css',
})
export class EditarTecnico implements OnInit {

  private servicio = inject(TecnicoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly Tipo = TipoValidacion;

  perfil: PerfilTecnicoModel | null = null;
  errorCarga = false;

  // Etapas de la edición
  fase: 'datos' | 'documentacion' = 'datos';
  pasoEdicion: 1 | 2 = 1;

  // Formulario de edición
  formulario = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    telefono: ['', Validators.required],
    sobreMi: [''],

    cuit: ['', [
      Validators.required,
      Validators.pattern(/^\d{11}$/)
    ]],

    descripcionTrabajo: ['', [
      Validators.required,
      Validators.minLength(10),
      contieneLetras
    ]],
  });

  // Foto
  fotoSeleccionada: File | null = null;
  fotoPreview: string | null = null;
  errorFoto: string | null = null;

  // Servicios seleccionados
  especialidadesElegidas: EspecialidadModel[] = [];
  uuidHabilidades: string[] = [];

  errorSeleccion: string | null = null;
  errorServidor: string | null = null;
  guardando = false;

  // Documentación de especialidades nuevas
  pendientes: Pendiente[] = [];
  hechas = new Set<string>();

  ngOnInit(): void {
    this.servicio.getMiPerfil().subscribe({
      next: (perfil) => {
        this.perfil = perfil;

        this.formulario.patchValue({
          nombre: perfil.nombre,
          apellido: perfil.apellido,
          telefono: perfil.telefono,
          sobreMi: perfil.sobreMi,
          cuit: perfil.cuit,
          descripcionTrabajo: perfil.descripcionTrabajo,
        });

        if (perfil.fotoBase64 && perfil.tipoImagen) {
          this.fotoPreview =
            `data:${perfil.tipoImagen};base64,${perfil.fotoBase64}`;
        }
      },
      error: () => {
        this.errorCarga = true;
      },
    });
  }

  // PASO 1: validar datos y continuar
  continuarEdicion(): void {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid || this.errorFoto) {
      return;
    }

    this.errorServidor = null;
    this.pasoEdicion = 2;
  }

  // Seleccionar foto
  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.errorFoto = 'El archivo seleccionado debe ser una imagen.';
      input.value = '';
      return;
    }

    if (archivo.size > 10 * 1024 * 1024) {
      this.errorFoto = 'La imagen no puede superar los 10 MB.';
      input.value = '';
      return;
    }

    this.errorFoto = null;

    // Liberar la vista previa anterior si era una URL temporal
    if (this.fotoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.fotoPreview);
    }

    this.fotoSeleccionada = archivo;
    this.fotoPreview = URL.createObjectURL(archivo);
  }

  // Recibir especialidades seleccionadas
  onEspecialidades(lista: EspecialidadModel[]): void {
    this.especialidadesElegidas = lista;
    this.errorSeleccion = null;
  }

  // Recibir habilidades seleccionadas
  onHabilidades(uuids: string[]): void {
    this.uuidHabilidades = uuids;
    this.errorSeleccion = null;
  }

  // Mensajes de validación
  errorMensaje(
    campo: 'nombre' | 'apellido' | 'telefono' | 'cuit' | 'descripcionTrabajo'
  ): string | null {

    const control = this.formulario.get(campo);

    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('pattern')) {
      return 'El CUIT debe tener exactamente 11 números.';
    }

    if (control.hasError('minlength')) {
      return 'La descripción debe tener al menos 10 caracteres.';
    }

    if (control.hasError('sinLetras')) {
      return 'El texto debe contener letras.';
    }

    return null;
  }

  // PASO 2: guardar todos los cambios
  guardar(): void {
    if (!this.perfil) {
      return;
    }

    this.formulario.markAllAsTouched();

    const haySeleccion =
      this.especialidadesElegidas.length > 0 &&
      this.uuidHabilidades.length > 0;

    this.errorSeleccion = haySeleccion
      ? null
      : 'Elegí al menos una especialidad y una habilidad.';

    if (this.formulario.invalid) {
      this.pasoEdicion = 1;
      return;
    }

    if (!haySeleccion || this.errorFoto) {
      return;
    }

    const v = this.formulario.getRawValue();

    this.errorServidor = null;
    this.guardando = true;

    // Construir los datos para enviar al backend
    const datos = new FormData();

    // Datos personales
    datos.append('nombre', v.nombre ?? '');
    datos.append('apellido', v.apellido ?? '');
    datos.append('telefono', v.telefono ?? '');
    datos.append('sobreMi', v.sobreMi ?? '');

    if (this.fotoSeleccionada) {
      datos.append('foto', this.fotoSeleccionada);
    }

    // Datos profesionales
    datos.append('cuit', v.cuit ?? '');
    datos.append('descripcionTrabajo', v.descripcionTrabajo ?? '');
    datos.append('proyectos', this.perfil.proyectos ?? '');

    // Habilidades
    this.uuidHabilidades.forEach(uuid => {
      datos.append('uuidHabilidades', uuid);
    });

    // Especialidades
    this.especialidadesElegidas.forEach(especialidad => {
      datos.append('uuidEspecialidades', especialidad.uuid);
    });

    this.servicio.actualizarPerfilTecnico(
      this.perfil.uuid,
      datos
    ).subscribe({
      next: () => {
        this.guardando = false;

        // Se comparan las especialidades nuevas con las anteriores
        this.armarPendientes();

        if (this.pendientes.length > 0) {
          this.fase = 'documentacion';
        } else {
          this.terminar();
        }
      },
      error: (e) => {
        this.guardando = false;

        this.errorServidor =
          e?.error?.mensaje ??
          e?.error?.message ??
          'No se pudo guardar el perfil.';
      },
    });
  }

  // Identificar especialidades nuevas que necesitan documentación
  private armarPendientes(): void {
    const previas = this.perfil?.especialidades ?? [];

    this.pendientes = this.especialidadesElegidas
      .filter(e => !previas.includes(e.nombreEspecialidad))
      .filter(e =>
        e.tipoValidacion === TipoValidacion.Certificado ||
        e.tipoValidacion === TipoValidacion.Portfolio
      )
      .map(e => ({
        especialidad: e,
        opciones: [
          {
            uuid: e.uuid,
            nombre: e.nombreEspecialidad
          }
        ],
      }));
  }

  // Marcar documentación como cargada
  marcarHecha(uuid: string): void {
    this.hechas = new Set(this.hechas).add(uuid);
  }

  // Comprobar si falta cargar documentación
  get faltan(): boolean {
    return this.pendientes.some(
      p => !this.hechas.has(p.especialidad.uuid)
    );
  }

  // Finalizar edición
  terminar(): void {
    this.router.navigate(['/mi-perfil-tecnico']);
  }
}
