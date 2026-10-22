
import { Component } from '@angular/core';
import {FormControl,FormGroup,ReactiveFormsModule,Validators} from '@angular/forms';
import { PagoModel } from '../../models/pago-model';
import { PagoService } from '../../services/pago';

@Component({
  selector: 'app-form-pago',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-pago.html',
  styleUrl: './form-pago.css',
})
  export class FormPago {

    monto: FormControl;
    metodoDePago: FormControl;
    fecha: FormControl;

    formulario: FormGroup;

    uuid: string | null = null;
    editando = false;

    constructor(public pService: PagoService) {

      this.monto = new FormControl('', [
        Validators.required,
        Validators.min(0.01)
      ]);

      this.metodoDePago = new FormControl('', [
        Validators.required
      ]);

      this.fecha = new FormControl('', [
        Validators.required
      ]);

      this.formulario = new FormGroup({
        monto: this.monto,
        metodoDePago: this.metodoDePago,
        fecha: this.fecha
      });
    }

    cargarPago(uuid: string): void {
      this.pService.getByUuid(uuid).subscribe({
        next: (respuesta: PagoModel) => {
          this.uuid = uuid;
          this.editando = true;
          this.formulario.patchValue(respuesta);
        },
        error: (e) => {
          console.error('Error al cargar el pago', e);
        }
      });
    }

    registrar(): void {
      if (this.formulario.invalid) {
        this.formulario.markAllAsTouched();
        return;
      }

      const pago: Partial<PagoModel> = this.formulario.value;

      this.pService.store(pago).subscribe({
        next: (respuesta) => {
          console.log('Pago registrado correctamente', respuesta);
          this.formulario.reset();
        },
        error: (e) => {
          console.error('Error al registrar el pago', e);
        }
      });
    }

    actualizar(): void {
      if (this.formulario.invalid) {
        this.formulario.markAllAsTouched();
        return;
      }

      if (!this.uuid) {
        console.error('No se encontró el UUID del pago');
        return;
      }

      const pago: Partial<PagoModel> = this.formulario.value;

      this.pService.update(this.uuid, pago).subscribe({
        next: (respuesta) => {
          console.log('Pago actualizado correctamente', respuesta);
          this.formulario.reset();
          this.uuid = null;
          this.editando = false;
        },
        error: (e) => {
          console.error('Error al actualizar el pago', e);
        }
      });
    }

    verSubmit(): void {
      console.log(this.formulario.value);
    }

  }
