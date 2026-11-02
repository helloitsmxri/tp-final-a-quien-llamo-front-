import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDatos } from '../../models/portfolio-datos';
import { PortfolioService } from '../../services/portfolio';
import { MAX_MB, archivoValido, enlaceOArchivo } from '../../../utils/validadores';

@Component({
  selector: 'app-form-portfolio',
  imports: [ReactiveFormsModule],
  templateUrl: './form-portfolio.html',
  styleUrl: './form-portfolio.css',
})
export class FormPortfolio {
  private fb = inject(FormBuilder);
  private servicio = inject(PortfolioService);

  // 'registro': todavía no hay sesión, solo valida y le da los datos al padre.
  // 'perfil': ya hay sesión, tiene su propio botón y manda el portfolio al back.
  @Input() modo: 'registro' | 'perfil' = 'perfil';
  @Input() uuidTecnico = '';
  // El portfolio del back es por especialidad: se elige entre las que tiene el técnico
  @Input() especialidades: { uuid: string; nombre: string }[] = [];
  @Output() creada = new EventEmitter<void>();

  @ViewChild('inputArchivo') inputArchivo?: ElementRef<HTMLInputElement>;

  readonly maxMb = MAX_MB;
  enviando = false;
  exito = false;
  errorServidor: string | null = null;

  form = this.fb.group(
    {
      uuidEspecialidad: ['', Validators.required],
      notasAspirante: ['', [Validators.required, Validators.maxLength(5000)]],
      enlaceExterno: ['', [Validators.maxLength(1000), Validators.pattern(/^https?:\/\/\S+$/i)]],
      archivo: [null as File | null, archivoValido],
    },
    { validators: enlaceOArchivo }
  );

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.controls.archivo.setValue(input.files?.[0] ?? null);
    this.form.controls.archivo.markAsTouched();
  }

  private estaVacio(): boolean {
    const v = this.form.getRawValue();
    return !v.uuidEspecialidad && !v.notasAspirante && !v.enlaceExterno && !v.archivo;
  }

  // Opcional en el registro, pero si empezó a cargarlo tiene que estar completo
  validar(): boolean {
    if (this.estaVacio()) return true;
    this.form.markAllAsTouched();
    return this.form.valid;
  }

  datos(): PortfolioDatos | null {
    if (this.estaVacio() || this.form.invalid) return null;
    const v = this.form.getRawValue();
    return {
      uuidEspecialidad: v.uuidEspecialidad ?? '',
      notasAspirante: (v.notasAspirante ?? '').trim(),
      enlaceExterno: (v.enlaceExterno ?? '').trim(),
      archivo: v.archivo,
    };
  }

  // Solo modo 'perfil': el botón llama a este método
  enviar(): void {
    this.form.markAllAsTouched();
    const datos = this.form.valid ? this.datos() : null;
    if (!datos) return;

    this.enviando = true;
    this.exito = false;
    this.errorServidor = null;

    this.servicio.crear(this.uuidTecnico, datos).subscribe({
      next: () => {
        this.enviando = false;
        this.exito = true;
        this.form.reset({ uuidEspecialidad: '' });
        if (this.inputArchivo) this.inputArchivo.nativeElement.value = '';
        this.creada.emit();
      },
      error: (e) => {
        this.enviando = false;
        this.errorServidor = e?.error?.message ?? 'No se pudo cargar el portfolio.';
      },
    });
  }

  errorMensaje(campo: 'uuidEspecialidad' | 'notasAspirante' | 'enlaceExterno' | 'archivo'): string | null {
    const c = this.form.controls[campo];
    if (!c.touched || !c.errors) return null;
    if (c.hasError('required')) return 'Este campo es obligatorio.';
    if (c.hasError('maxlength')) return 'El texto es demasiado largo.';
    if (c.hasError('pattern')) return 'Ingresá un link que empiece con http:// o https://';
    if (c.hasError('tipoInvalido')) return 'Solo se aceptan PDF, JPG o PNG.';
    if (c.hasError('tamanioExcedido')) return `El archivo no puede pesar más de ${this.maxMb} MB.`;
    return null;
  }
}