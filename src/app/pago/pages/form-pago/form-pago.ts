
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { PagoModel } from '../../models/pago-model';
import { PagoService } from '../../services/pago';
import { MetodoDePago } from '../../enum/metodo-de-pago';

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
  monto: FormControl;
  currency: FormControl;
  numeroTarjeta: FormControl;
  cvv: FormControl;
  vencimientoTarjeta: FormControl;
  franquicia: FormControl;

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

    this.monto = new FormControl('', [
      Validators.required,
      Validators.min(0.01)
    ]);

    this.currency = new FormControl('ARS', [
      Validators.required
    ]);

    this.numeroTarjeta = new FormControl('', [
      Validators.required,
      Validators.minLength(13),
      Validators.maxLength(19)
    ]);

    this.cvv = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(4)
    ]);

    this.vencimientoTarjeta = new FormControl('', [
      Validators.required
    ]);

    this.franquicia = new FormControl('', [
      Validators.required
    ]);

    this.formulario = new FormGroup({
      uuidTrabajo: this.uuidTrabajo,
      metodoDePago: this.metodoDePago,
      buyerFullName: this.buyerFullName,
      buyerEmail: this.buyerEmail,
      buyerDNI: this.buyerDNI,
      buyerPhone: this.buyerPhone,
      monto: this.monto,
      currency: this.currency,
      numeroTarjeta: this.numeroTarjeta,
      cvv: this.cvv,
      vencimientoTarjeta: this.vencimientoTarjeta,
      franquicia: this.franquicia
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
        this.formulario.reset({
          currency: 'ARS'
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

    const pago: Partial<PagoModel> = this.formulario.value;

    this.pService.update(this.uuid, pago).subscribe({
      next: (respuesta) => {
        console.log('Pago actualizado correctamente', respuesta);
        this.formulario.reset({
          currency: 'ARS'
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
    console.log(this.formulario.value);
  }
}

