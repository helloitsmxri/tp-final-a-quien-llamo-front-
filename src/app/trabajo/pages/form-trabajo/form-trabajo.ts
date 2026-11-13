
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { forkJoin, timer } from 'rxjs';

import { TrabajoService } from '../../services/trabajo';
import { TrabajoRequestModel } from '../../models/trabajo-request-model';

@Component({
  selector: 'app-form-trabajo',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-trabajo.html',
  styleUrl: './form-trabajo.css',
})
export class FormTrabajo {

  // El UUID se obtiene directamente de la URL.
  uuidPresupuesto = '';

  descripcionTrabajo: FormControl;
  fechaEstimadaInicio: FormControl;
  fechaEstimadaFin: FormControl;

  formulario: FormGroup;

  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    public tService: TrabajoService,
    private route: ActivatedRoute
  ) {

    this.descripcionTrabajo = new FormControl('', [
      Validators.required,
      Validators.minLength(50),
      Validators.maxLength(1000)
    ]);

    this.fechaEstimadaInicio = new FormControl('', [
      Validators.required
    ]);

    this.fechaEstimadaFin = new FormControl('', [
      Validators.required
    ]);

    this.formulario = new FormGroup({
      descripcionTrabajo: this.descripcionTrabajo,
      fechaEstimadaInicio: this.fechaEstimadaInicio,
      fechaEstimadaFin: this.fechaEstimadaFin
    });

    // Recuperar el UUID del presupuesto desde la URL.
    this.route.paramMap.subscribe(params => {
      this.uuidPresupuesto = params.get('uuid') ?? '';
    });
  }

  manejarEnvio(): void {

    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (!this.uuidPresupuesto) {
      this.mensajeError = 'No se recibió el UUID del presupuesto.';
      return;
    }

    const trabajo: TrabajoRequestModel = {
      uuidPresupuesto: this.uuidPresupuesto,
      descripcionTrabajo: this.descripcionTrabajo.value,
      fechaEstimadaInicio: this.fechaEstimadaInicio.value,
      fechaEstimadaFin: this.fechaEstimadaFin.value
    };

    if (
      new Date(trabajo.fechaEstimadaFin) <
      new Date(trabajo.fechaEstimadaInicio)
    ) {
      this.mensajeError =
        'La fecha de finalización no puede ser anterior a la fecha de inicio.';
      return;
    }

    this.cargando = true;

    // La petición se ejecuta mientras transcurren los 3 segundos.
    // Se espera a que ambas operaciones terminen para mostrar el resultado.
    forkJoin({
      respuesta: this.tService.storeTrabajo(trabajo),
      espera: timer(3000)
    }).subscribe({
      next: ({ respuesta }) => {

        console.log('Trabajo registrado correctamente', respuesta);

        this.cargando = false;
        this.mensajeExito = '¡Trabajo registrado correctamente!';

        this.formulario.reset({
          descripcionTrabajo: '',
          fechaEstimadaInicio: '',
          fechaEstimadaFin: ''
        });
      },

      error: (e) => {

        console.error('Error al registrar trabajo', e);

        this.cargando = false;
        this.mensajeError =
          'No se pudo registrar el trabajo. Intentá nuevamente.';
      }
    });
  }

  verSubmit(): void {
    console.log({
      uuidPresupuesto: this.uuidPresupuesto,
      ...this.formulario.value
    });
  }

  canDeactivate(): boolean {
    if (this.formulario.dirty) {
      return window.confirm(
        '¿Estás seguro de que querés salir del formulario? Los cambios podrían perderse.'
      );
    }

    return true;
  }

}
