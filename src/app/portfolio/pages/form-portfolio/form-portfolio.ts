import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PortfolioDatos } from '../../models/portfolio-datos';
import { PortfolioService } from '../../services/portfolio';
import { MAX_MB, archivoValido, enlaceOArchivo } from '../../../utils/validadores';
import { contieneLetras } from '../../../utils/validadores-texto';

@Component({
  selector: 'app-form-portfolio',
  imports: [ReactiveFormsModule],
  templateUrl: './form-portfolio.html',
  styleUrl: './form-portfolio.css',
})
export class FormPortfolio implements OnChanges {
  private fb = inject(FormBuilder);
  private servicio = inject(PortfolioService);

  // 'registro': todavía no hay sesión, solo valida y le da los datos al padre.
  // 'perfil': ya hay sesión, tiene su propio botón y manda el portfolio al back.
  @Input() modo: 'registro' | 'perfil' = 'perfil';
  @Input() uuidTecnico = '';
  // en el registro: true si alguna especialidad elegida se valida con portfolio
  @Input() obligatorio = false;
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
      notasAspirante: ['', [Validators.required, Validators.maxLength(5000), contieneLetras]],
      enlaceExterno: ['', [Validators.maxLength(1000), Validators.pattern(/^https?:\/\/\S+$/i)]],
      archivo: [null as File | null, archivoValido],
    },
    { validators: enlaceOArchivo }
  );

  // Si el técnico tiene una sola especialidad, no hace falta que la elija: queda seleccionada
  ngOnChanges(cambios: SimpleChanges): void {
    const control = this.form.controls.uuidEspecialidad;
    if (!cambios['especialidades']) return;

    // si la que estaba elegida ya no está en la lista (cambió las especialidades), se limpia
    if (control.value && !this.especialidades.some((e) => e.uuid === control.value)) {
      control.setValue('');
    }
    if (this.especialidades.length === 1 && !control.value) {
      control.setValue(this.especialidades[0].uuid);
    }
  }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.form.controls.archivo.setValue(input.files?.[0] ?? null);
    this.form.controls.archivo.markAsTouched();
  }

  private estaVacio(): boolean {
    const v = this.form.getRawValue();
    // la especialidad sola no cuenta: puede venir preseleccionada y el portfolio es opcional
    return !v.notasAspirante && !v.enlaceExterno && !v.archivo;
  }

  // Opcional en el registro, pero si empezó a cargarlo tiene que estar completo
  get titulo(): string {
    if (this.modo === 'perfil') return 'Cargar portfolio';
    return `Portfolio (${this.obligatorio ? 'obligatorio' : 'opcional'})`;
  }

  validar(): boolean {
    if (!this.obligatorio && this.estaVacio()) return true;
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
    if (c.hasError('sinLetras')) return 'Contanos con palabras, no puede ser solo números.';
    if (c.hasError('maxlength')) return 'El texto es demasiado largo.';
    if (c.hasError('pattern')) return 'Ingresá un link que empiece con http:// o https://';
    if (c.hasError('tipoInvalido')) return 'Solo se aceptan PDF, JPG o PNG.';
    if (c.hasError('tamanioExcedido')) return `El archivo no puede pesar más de ${this.maxMb} MB.`;
    return null;
  }
}