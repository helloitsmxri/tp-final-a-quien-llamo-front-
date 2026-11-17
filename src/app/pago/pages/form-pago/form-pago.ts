import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { PagoRequestModel } from '../../models/pago-request-model';
import { PagoResponseModel } from '../../models/pago-response-model';
import { PagoService } from '../../services/pago';
import { MetodoDePago } from '../../enum/metodo-de-pago';
import { ProveedorPago } from '../../enum/proveedor-pago';

@Component({
  selector: 'app-form-pago',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-pago.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './form-pago.css',
})
export class FormPago {

  private route = inject(ActivatedRoute);

  uuidTrabajo: FormControl<string>;
  metodoDePago: FormControl<MetodoDePago>;
  proveedorDePago: FormControl<ProveedorPago>;

  buyerFullName: FormControl<string>;
  buyerEmail: FormControl<string>;
  buyerDNI: FormControl<string>;
  buyerPhone: FormControl<string>;

  formulario: FormGroup;

  cargando = false;

  constructor(public pService: PagoService) {

    this.uuidTrabajo = new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    });

    this.metodoDePago = new FormControl(MetodoDePago.Transferencia, {
      nonNullable: true,
      validators: [Validators.required]
    });

    this.proveedorDePago = new FormControl(ProveedorPago.MERCADO_PAGO, {
      nonNullable: true,
      validators: [Validators.required]
    });

    this.buyerFullName = new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2)
      ]
    });

    this.buyerEmail = new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    });

    this.buyerDNI = new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    });

    this.buyerPhone = new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^\d{10}$/)
      ]
    });

    this.formulario = new FormGroup({
      uuidTrabajo: this.uuidTrabajo,
      metodoDePago: this.metodoDePago,
      proveedorDePago: this.proveedorDePago,
      buyerFullName: this.buyerFullName,
      buyerEmail: this.buyerEmail,
      buyerDNI: this.buyerDNI,
      buyerPhone: this.buyerPhone
    });

    // Obtener automáticamente el UUID del trabajo desde la URL.
    const uuid = this.route.snapshot.queryParamMap.get('uuidTrabajo');

    if (uuid) {
      this.uuidTrabajo.setValue(uuid);
    }
  }

  registrar(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const pago: PagoRequestModel = this.formulario.getRawValue();

    this.cargando = true;

    this.pService.store(pago).subscribe({

      next: (respuesta: PagoResponseModel) => {

        console.log('Pago registrado correctamente', respuesta);

        this.cargando = false;

        if (respuesta.checkoutUrl) {
          window.location.href = respuesta.checkoutUrl;
        } else {
          console.error('No se recibió una URL de Mercado Pago.');
        }

      },

      error: (e) => {
        console.error('Error al registrar el pago:', e);
        this.cargando = false;
      }

    });
  }

  verSubmit(): void {
    console.log(this.formulario.getRawValue());
  }
}