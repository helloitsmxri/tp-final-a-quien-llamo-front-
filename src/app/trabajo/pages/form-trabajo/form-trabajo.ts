
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

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

  uuidPresupuesto: FormControl;
  descripcionTrabajo: FormControl;
  fechaEstimadaInicio: FormControl;
  fechaEstimadaFin: FormControl;

  formulario: FormGroup;

  constructor(public tService: TrabajoService) {

    this.uuidPresupuesto = new FormControl('', [
      Validators.required
    ]);

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
      uuidPresupuesto: this.uuidPresupuesto,
      descripcionTrabajo: this.descripcionTrabajo,
      fechaEstimadaInicio: this.fechaEstimadaInicio,
      fechaEstimadaFin: this.fechaEstimadaFin
    });
  }

  manejarEnvio(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const trabajo: TrabajoRequestModel = {
      uuidPresupuesto: this.uuidPresupuesto.value,
      descripcionTrabajo: this.descripcionTrabajo.value,
      fechaEstimadaInicio: this.fechaEstimadaInicio.value,
      fechaEstimadaFin: this.fechaEstimadaFin.value
    };

    if (new Date(trabajo.fechaEstimadaFin) < new Date(trabajo.fechaEstimadaInicio)) {
      console.error('La fecha de finalizacion no puede ser anterior a la fecha de inicio.');
      return;
    }

    this.tService.storeTrabajo(trabajo).subscribe({
      next: (respuesta) => {
        console.log('Trabajo registrado correctamente', respuesta);

        this.formulario.reset({
          uuidPresupuesto: '',
          descripcionTrabajo: '',
          fechaEstimadaInicio: '',
          fechaEstimadaFin: ''
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
