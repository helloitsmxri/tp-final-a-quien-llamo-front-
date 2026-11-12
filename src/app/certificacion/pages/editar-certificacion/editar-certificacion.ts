import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CertificacionService } from '../../services/certificacion';
import { CertificacionModel } from '../../models/certificacion-model';
import { CertificacionEdicionDatos } from '../../models/certificacion-edicion-datos';

import { MAX_MB, archivoValido, fechaFutura } from '../../../utils/validadores';
import { contieneLetras, matriculaValida } from '../../../utils/validadores-texto';
import { Calendario } from '../../../components/calendario/calendario';

type Campo =
  | 'titulo'
  | 'numMatricula'
  | 'enteOtorgador'
  | 'fechaVencimiento'
  | 'archivo';

@Component({
  selector: 'app-editar-certificacion',
  imports: [ReactiveFormsModule, Calendario],
  templateUrl: './editar-certificacion.html',
  styleUrl: './editar-certificacion.css',
})
export class EditarCertificacion implements OnChanges {

  private fb = inject(FormBuilder);
  private servicio = inject(CertificacionService);

  @Input() certificacion!: CertificacionModel;

  @Output() guardada = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  @ViewChild('inputArchivo') inputArchivo?: ElementRef<HTMLInputElement>;

  readonly maxMb = MAX_MB;

  enviando = false;
  exito = false;
  errorServidor: string | null = null;

  formulario = this.fb.group({
    titulo: ['', [Validators.required, Validators.maxLength(150)]],
    numMatricula: ['', [Validators.required, Validators.maxLength(100), matriculaValida]],
    enteOtorgador: ['', [Validators.required, Validators.maxLength(100), contieneLetras]],
    fechaVencimiento: ['', [Validators.required, fechaFutura]],
    archivo: [null as File | null, [archivoValido]],
  });

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios['certificacion'] && this.certificacion) {

      this.formulario.patchValue({
        titulo: this.certificacion.titulo,
        numMatricula: this.certificacion.numMatricula,
        enteOtorgador: this.certificacion.enteOtorgador,
        fechaVencimiento: this.certificacion.fechaVencimiento,
        archivo: null
      });

      // El archivo es opcional al editar.
      this.formulario.controls.archivo.setValidators([archivoValido]);
      this.formulario.controls.archivo.updateValueAndValidity();

      this.exito = false;
      this.errorServidor = null;
    }
  }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.formulario.controls.archivo.setValue(input.files?.[0] ?? null);
    this.formulario.controls.archivo.markAsTouched();
  }

  guardar(): void {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid || !this.certificacion) return;

    const v = this.formulario.getRawValue();

    const datos: CertificacionEdicionDatos = {
      titulo: (v.titulo ?? '').trim(),

      // Se conserva la especialidad original.
      uuidEspecialidad: this.certificacion.uuidEspecialidad ?? '',

      numMatricula: (v.numMatricula ?? '').trim(),
      enteOtorgador: (v.enteOtorgador ?? '').trim(),
      fechaVencimiento: v.fechaVencimiento ?? '',
      archivo: v.archivo
    };

    this.enviando = true;
    this.errorServidor = null;
    this.exito = false;

    this.servicio.actualizar(this.certificacion.uuid, datos).subscribe({
      next: () => {
        this.enviando = false;
        this.exito = true;
        this.guardada.emit();
      },
      error: (e) => {
        this.enviando = false;
        this.errorServidor = e?.error?.message ?? 'No se pudo actualizar la certificación.';
      }
    });
  }

  errorMensaje(campo: Campo): string | null {
    const c = this.formulario.controls[campo];

    if (!c.touched || !c.errors) return null;

    if (c.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (c.hasError('maxlength')) {
      return campo === 'titulo'
        ? 'El título no puede superar los 150 caracteres.'
        : 'No puede superar los 100 caracteres.';
    }

    if (c.hasError('matricula')) {
      return 'La matrícula solo puede tener letras, números y . - / y debe incluir al menos un número.';
    }

    if (c.hasError('sinLetras')) {
      return 'El ente otorgador tiene que incluir letras.';
    }

    if (c.hasError('fechaPasada')) {
      return 'La fecha de vencimiento tiene que ser posterior a hoy.';
    }

    if (c.hasError('tipoInvalido')) {
      return 'Solo se aceptan PDF, JPG o PNG.';
    }

    if (c.hasError('tamanioExcedido')) {
      return `El archivo no puede pesar más de ${this.maxMb} MB.`;
    }

    return null;
  }
}