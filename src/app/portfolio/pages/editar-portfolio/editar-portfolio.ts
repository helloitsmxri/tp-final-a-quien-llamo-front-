
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { PortfolioService } from '../../services/portfolio';
import { PortfolioUsuarioModel } from '../../models/portfolio-usuario';
import { PortfolioEdicionDatos } from '../../models/portfolio-edicion-datos';

import { TecnicoService } from '../../../tecnico/services/tecnico';

import { MAX_MB, archivoValido } from '../../../utils/validadores';
import { contieneLetras } from '../../../utils/validadores-texto';

import { EstadoVerificacion } from '../../enum/estado-verificacion';

@Component({
  selector: 'app-editar-portfolio',
  imports: [ReactiveFormsModule],
  templateUrl: './editar-portfolio.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './editar-portfolio.css',
})
export class EditarPortfolio implements OnInit {

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private servicio = inject(PortfolioService);
  private tecnicoService = inject(TecnicoService);

  @ViewChild('inputArchivo') inputArchivo?: ElementRef<HTMLInputElement>;

  readonly maxMb = MAX_MB;

  portfolio: PortfolioUsuarioModel | null = null;

  uuidTecnico = '';
  uuidPortfolio = '';

  cargando = true;
  guardando = false;

  error: string | null = null;
  exito = false;

  archivoSeleccionado: File | null = null;

  formulario = this.fb.group({
    titulo: ['', [
      Validators.required,
      Validators.maxLength(150)
    ]],
    notasAspirante: ['', [
      Validators.required,
      Validators.maxLength(5000),
      contieneLetras
    ]],
    enlaceExterno: ['', [
      Validators.maxLength(255),
      Validators.pattern(/^https?:\/\/\S+$/i)
    ]],
    archivo: [null as File | null, archivoValido]
  });

  ngOnInit(): void {
    this.uuidPortfolio = this.route.snapshot.paramMap.get('uuid') ?? '';

    if (!this.uuidPortfolio) {
      this.error = 'No se recibió el identificador del portfolio.';
      this.cargando = false;
      return;
    }

    // Primero obtenemos el técnico autenticado.
    this.tecnicoService.getMiPerfil().subscribe({
      next: (tecnico) => {
        this.uuidTecnico = tecnico.uuid;

        if (!this.uuidTecnico) {
          this.error = 'No se pudo identificar al técnico autenticado.';
          this.cargando = false;
          return;
        }

        console.log('UUID del técnico:', this.uuidTecnico);

        // Recién después cargamos el portfolio.
        this.cargarPortfolio();
      },
      error: (e) => {
        console.error('Error al obtener el técnico:', e);
        this.error = 'No se pudo identificar al técnico autenticado.';
        this.cargando = false;
      }
    });
  }

  cargarPortfolio(): void {
    this.cargando = true;
    this.error = null;

    this.servicio.getByUuid(this.uuidPortfolio).subscribe({
      next: (portfolio) => {
        this.portfolio = portfolio;

        if (portfolio.estadoVerificacion === EstadoVerificacion.Aprobado) {
          this.error = 'No se puede editar un portfolio aprobado.';
          this.cargando = false;
          return;
        }

        this.formulario.patchValue({
          titulo: portfolio.titulo,
          notasAspirante: portfolio.notasAspirante ?? '',
          enlaceExterno: portfolio.enlaceExterno ?? '',
          archivo: null
        });

        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar el portfolio:', e);
        this.error = e?.error?.message ?? 'No se pudo cargar el portfolio.';
        this.cargando = false;
      }
    });
  }

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.archivoSeleccionado = input.files?.[0] ?? null;

    this.formulario.controls.archivo.setValue(this.archivoSeleccionado);
    this.formulario.controls.archivo.markAsTouched();
  }

  guardar(): void {
    if (!this.portfolio || this.guardando) return;

    this.formulario.markAllAsTouched();
    this.error = null;
    this.exito = false;

    if (!this.uuidTecnico || !this.uuidPortfolio) {
      this.error = 'Falta identificar al técnico o al portfolio.';
      return;
    }

    if (this.formulario.invalid) return;

    const valores = this.formulario.getRawValue();
    const enlace = (valores.enlaceExterno ?? '').trim();

    const tieneArchivoAnterior = !!this.portfolio.archivoAdjunto;
    const tieneArchivoNuevo = !!this.archivoSeleccionado;

    if (!enlace && !tieneArchivoAnterior && !tieneArchivoNuevo) {
      this.error = 'Agregá un enlace o adjuntá un archivo.';
      return;
    }

    const datos: PortfolioEdicionDatos = {
      titulo: (valores.titulo ?? '').trim(),
      notasAspirante: (valores.notasAspirante ?? '').trim(),
      enlaceExterno: enlace,
      archivo: this.archivoSeleccionado
    };

    this.guardando = true;

    this.servicio.actualizar(
      this.uuidTecnico,
      this.uuidPortfolio,
      datos
    ).subscribe({
      next: () => {
        this.guardando = false;
        this.exito = true;

        this.router.navigate(['/mis-portfolios']);
      },
      error: (e) => {
        console.error('Error al actualizar el portfolio:', e);
        this.guardando = false;
        this.error = e?.error?.message ?? 'No se pudo actualizar el portfolio.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/mis-portfolios']);
  }

  errorMensaje(
    campo: 'titulo' | 'notasAspirante' | 'enlaceExterno' | 'archivo'
  ): string | null {
    const control = this.formulario.controls[campo];

    if (!control.touched || !control.errors) return null;

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('sinLetras')) {
      return 'Ingresá una descripción con palabras.';
    }

    if (control.hasError('maxlength')) {
      if (campo === 'titulo') {
        return 'El título no puede superar los 150 caracteres.';
      }

      if (campo === 'enlaceExterno') {
        return 'El enlace no puede superar los 255 caracteres.';
      }

      return 'El texto es demasiado largo.';
    }

    if (control.hasError('pattern')) {
      return 'Ingresá un link que empiece con http:// o https://';
    }

    if (control.hasError('tipoInvalido')) {
      return 'Solo se aceptan PDF, JPG o PNG.';
    }

    if (control.hasError('tamanioExcedido')) {
      return `El archivo no puede pesar más de ${this.maxMb} MB.`;
    }

    return null;
  }
}
