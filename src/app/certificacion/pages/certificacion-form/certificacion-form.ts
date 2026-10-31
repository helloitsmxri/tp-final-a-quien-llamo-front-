import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CertificacionService } from '../../services/certificacion';
import { CertificacionDatos } from '../../models/certificacion-datos';
import { MAX_MB, archivoValido, fechaFutura } from '../../../utils/validadores';

// tiene que ir ANTES del decorador: entre @Component y la clase no puede haber nada
type Campo = 'numMatricula' | 'enteOtorgador' | 'fechaVencimiento' | 'archivo';

@Component({
  selector: 'app-certificacion-form',
  imports: [ReactiveFormsModule],
  templateUrl: './certificacion-form.html',
  styleUrl: './certificacion-form.css',
})
export class CertificacionForm {
  private fb = inject(FormBuilder);
  private servicio = inject(CertificacionService);

  @Input() modo: 'registro' | 'perfil' = 'perfil';
  @Input() uuidTecnico = '';
  @Output() creada = new EventEmitter<void>();
  @ViewChild('inputArchivo') inputArchivo?: ElementRef<HTMLInputElement>;

  readonly maxMb = MAX_MB;
  enviando = false;
  exito = false;
  errorServidor: string | null = null;

  formulario = this.fb.group({
    numMatricula: ['', [Validators.required, Validators.maxLength(100)]],
    enteOtorgador: ['', [Validators.required, Validators.maxLength(100)]],
    fechaVencimiento: ['', [Validators.required, fechaFutura]],
    archivo: [null as File | null, [Validators.required, archivoValido]],
  });

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const control = this.formulario.controls.archivo;
    control.setValue(input.files?.[0] ?? null);
    control.markAsTouched();
  }

  private estaVacio(): boolean {
    const v = this.formulario.getRawValue();
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
        this.formulario.reset();
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
    if (c.hasError('fechaPasada')) return 'La fecha de vencimiento tiene que ser posterior a hoy.';
    if (c.hasError('tipoInvalido')) return 'Solo se aceptan PDF, JPG o PNG.';
    if (c.hasError('tamanioExcedido')) return `El archivo no puede pesar más de ${this.maxMb} MB.`;
    return null;
  }
}