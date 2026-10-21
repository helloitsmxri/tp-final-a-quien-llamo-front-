
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { TrabajoService } from '../../services/trabajo';
import { FormTrabajoModel } from '../../models/form-trabajo-model';
import { EstadoTrabajo } from '../../enum/estado-trabajo';

@Component({
  selector: 'app-form-trabajo',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-trabajo.html',
  styleUrl: './form-trabajo.css',
})
export class FormTrabajo {

  uuidPresupuesto: FormControl;
  descripcionTrabajo: FormControl;
  fechaEstimadaInicio: FormControl;
  fechaEstimadaFin: FormControl;
  estadoTrabajo: FormControl;

  formulario: FormGroup;

  estadosTrabajo = Object.values(EstadoTrabajo);

  constructor(public tService: TrabajoService) {

    this.uuidPresupuesto = new FormControl('', [
      Validators.required
    ]);

    this.descripcionTrabajo = new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(500)
    ]);

    this.fechaEstimadaInicio = new FormControl('', [
      Validators.required
    ]);

    this.fechaEstimadaFin = new FormControl('', [
      Validators.required
    ]);

    this.estadoTrabajo = new FormControl(
      EstadoTrabajo.Pendiente,
      [Validators.required]
    );

    this.formulario = new FormGroup({
      uuidPresupuesto: this.uuidPresupuesto,
      descripcionTrabajo: this.descripcionTrabajo,
      fechaEstimadaInicio: this.fechaEstimadaInicio,
      fechaEstimadaFin: this.fechaEstimadaFin,
      estadoTrabajo: this.estadoTrabajo
    });
  }

  manejarEnvio(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const trabajo: FormTrabajoModel = {
      uuidPresupuesto: this.uuidPresupuesto.value,
      descripcionTrabajo: this.descripcionTrabajo.value,
      fechaEstimadaInicio: this.fechaEstimadaInicio.value,
      fechaEstimadaFin: this.fechaEstimadaFin.value,
      estadoTrabajo: this.estadoTrabajo.value
    };

    this.tService.store(trabajo).subscribe({
      next: (respuesta) => {
        console.log('Trabajo registrado correctamente', respuesta);

        this.formulario.reset({
          uuidPresupuesto: '',
          descripcionTrabajo: '',
          fechaEstimadaInicio: '',
          fechaEstimadaFin: '',
          estadoTrabajo: EstadoTrabajo.Pendiente
        });
      },
      error: (e) => {
        console.error('Error al registrar trabajo', e);
      }
    });
  }

  verSubmit(): void {
    console.log(this.formulario.value);
  }
}

