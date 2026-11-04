import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CertificacionService } from '../../services/certificacion';
import { CertificacionDatos } from '../../models/certificacion-datos';
import { MAX_MB, archivoValido, fechaFutura } from '../../../utils/validadores';
import { contieneLetras, matriculaValida } from '../../../utils/validadores-texto';
import { Calendario } from '../../../components/calendario/calendario';

// tiene que ir ANTES del decorador: entre @Component y la clase no puede haber nada
type Campo = 'uuidEspecialidad' | 'numMatricula' | 'enteOtorgador' | 'fechaVencimiento' | 'archivo';

@Component({
  selector: 'app-certificacion-form',
  imports: [ReactiveFormsModule, Calendario],
  templateUrl: './certificacion-form.html',
  styleUrl: './certificacion-form.css',
})
export class CertificacionForm implements OnChanges {
  private fb = inject(FormBuilder);
  private servicio = inject(CertificacionService);

  @Input() modo: 'registro' | 'perfil' = 'perfil';
  @Input() obligatorio = false;
  @Input() uuidTecnico = '';
  // La certificación respalda una especialidad del técnico: se elige entre estas
  @Input() especialidades: { uuid: string; nombre: string }[] = [];
  @Output() creada = new EventEmitter<void>();
  @ViewChild('inputArchivo') inputArchivo?: ElementRef<HTMLInputElement>;

  readonly maxMb = MAX_MB;
  enviando = false;
  exito = false;
  errorServidor: string | null = null;

  formulario = this.fb.group({
    uuidEspecialidad: ['', Validators.required],
    numMatricula: ['', [Validators.required, Validators.maxLength(100), matriculaValida]],
    enteOtorgador: ['', [Validators.required, Validators.maxLength(100), contieneLetras]],
    fechaVencimiento: ['', [Validators.required, fechaFutura]],
    archivo: [null as File | null, [Validators.required, archivoValido]],
  });

  // Si hay una sola especialidad, queda seleccionada; si la elegida ya no está en la lista, se limpia
  ngOnChanges(cambios: SimpleChanges): void {
    if (!cambios['especialidades']) return;
    const control = this.formulario.controls.uuidEspecialidad;

    if (control.value && !this.especialidades.some((e) => e.uuid === control.value)) {
      control.setValue('');
    }
    if (this.especialidades.length === 1 && !control.value) {
      control.setValue(this.especialidades[0].uuid);
    }
  }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const control = this.formulario.controls.archivo;
    control.setValue(input.files?.[0] ?? null);
    control.markAsTouched();
  }

  private estaVacio(): boolean {
    const v = this.formulario.getRawValue();
    // la especialidad sola no cuenta: puede venir preseleccionada y el documento es opcional
    return !v.numMatricula && !v.enteOtorgador && !v.fechaVencimiento && !v.archivo;
  }

  validar(): boolean {
    if (this.estaVacio()) return true;
    this.formulario.markAllAsTouched();
    return this.formulario.valid;
  }

  datos(): CertificacionDatos | null {
    if (this.estaVacio() || this.formulario.invalid) return null;
    const v = this.formulario.getRawValue();
    return {
      uuidEspecialidad: v.uuidEspecialidad ?? '',
      numMatricula: (v.numMatricula ?? '').trim(),
      enteOtorgador: (v.enteOtorgador ?? '').trim(),
      fechaVencimiento: v.fechaVencimiento ?? '',
      archivo: v.archivo as File,
    };
  }

  enviar(): void {
    this.formulario.markAllAsTouched();
    const datos = this.formulario.valid ? this.datos() : null;
    if (!datos) return;

    this.enviando = true;
    this.exito = false;
    this.errorServidor = null;

    this.servicio.crear(this.uuidTecnico, datos).subscribe({
      next: () => {
        this.enviando = false;
        this.exito = true;
        this.formulario.reset({ uuidEspecialidad: '' });
        if (this.inputArchivo) this.inputArchivo.nativeElement.value = '';
        this.creada.emit();
      },
      error: (e) => {
        this.enviando = false;
        this.errorServidor = e?.error?.message ?? 'No se pudo cargar el título.';
      },
    });
  }

  errorMensaje(campo: Campo): string | null {
    const c = this.formulario.controls[campo];
    if (!c.touched || !c.errors) return null;
    if (c.hasError('required')) return campo === 'archivo' ? 'Adjuntá el archivo.' : 'Este campo es obligatorio.';
    if (c.hasError('maxlength')) return 'No puede superar los 100 caracteres.';
    if (c.hasError('matricula')) return 'La matrícula solo puede tener letras, números y . - / y debe incluir al menos un número.';
    if (c.hasError('sinLetras')) return 'El ente otorgador tiene que incluir letras, no puede ser solo números.';
    if (c.hasError('fechaPasada')) return 'La fecha de vencimiento tiene que ser posterior a hoy.';
    if (c.hasError('tipoInvalido')) return 'Solo se aceptan PDF, JPG o PNG.';
    if (c.hasError('tamanioExcedido')) return `El archivo no puede pesar más de ${this.maxMb} MB.`;
    return null;
  }
}