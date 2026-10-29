
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { FormPagoModel } from '../../models/form-pago-model';
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

  uuidTrabajo: FormControl;
  metodoDePago: FormControl;
  buyerFullName: FormControl;
  buyerEmail: FormControl;
  buyerDNI: FormControl;
  buyerPhone: FormControl;

  formulario: FormGroup;

  uuid: string | null = null;
  editando = false;

  constructor(public pService: PagoService) {

    this.uuidTrabajo = new FormControl('', [
      Validators.required
    ]);

    this.metodoDePago = new FormControl('', [
      Validators.required
    ]);

    this.buyerFullName = new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]);

    this.buyerEmail = new FormControl('', [
      Validators.required,
      Validators.email
    ]);

    this.buyerDNI = new FormControl('', [
      Validators.required
    ]);

    this.buyerPhone = new FormControl('', [
      Validators.required,
      Validators.maxLength(10)
    ]);

    this.formulario = new FormGroup({
      uuidTrabajo: this.uuidTrabajo,
      metodoDePago: this.metodoDePago,
      buyerFullName: this.buyerFullName,
      buyerEmail: this.buyerEmail,
      buyerDNI: this.buyerDNI,
      buyerPhone: this.buyerPhone
    });
  }

  cargarPago(uuid: string): void {
    this.pService.getByUuid(uuid).subscribe({
      next: (respuesta: PagoModel) => {
        this.uuid = uuid;
        this.editando = true;

        this.formulario.patchValue({
          uuidTrabajo: respuesta.uuidTrabajo,
          metodoDePago: respuesta.metodoDePago
        });
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

    const pago: FormPagoModel = this.formulario.getRawValue();

    this.pService.store(pago).subscribe({
      next: (respuesta) => {
        console.log('Pago registrado correctamente', respuesta);

        this.formulario.reset({
          uuidTrabajo: '',
          metodoDePago: '',
          buyerFullName: '',
          buyerEmail: '',
          buyerDNI: '',
          buyerPhone: ''
        });
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

    const pago: Partial<FormPagoModel> = this.formulario.getRawValue();

    this.pService.update(this.uuid, pago).subscribe({
      next: (respuesta) => {
        console.log('Pago actualizado correctamente', respuesta);

        this.formulario.reset({
          uuidTrabajo: '',
          metodoDePago: '',
          buyerFullName: '',
          buyerEmail: '',
          buyerDNI: '',
          buyerPhone: ''
        });

        this.uuid = null;
        this.editando = false;
      },
      error: (e) => {
        console.error('Error al actualizar el pago', e);
      }
    });
  }

  verSubmit(): void {
    console.log(this.formulario.getRawValue());
  }
}
