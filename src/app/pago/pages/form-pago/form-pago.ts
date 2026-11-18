
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
import { AlertaService } from '../../../shared/alertas/service/alerta-service';

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

  private alertaService = inject(AlertaService);
  errorRegistro: string | null = null;

  // Indica si el pago fue creado correctamente.
  pagoCreado = false;

  // Paso actual del formulario.
  paso = 1;

  // Relación entre proveedores y métodos disponibles.
  private readonly metodosPorProveedor: Record<ProveedorPago, MetodoDePago[]> = {
    [ProveedorPago.MERCADO_PAGO]: [
      MetodoDePago.Transferencia
    ]
  };

  // Opciones disponibles.
  proveedoresDisponibles = Object.values(ProveedorPago);
  metodosDisponibles: MetodoDePago[] = [];

  uuidTrabajo: FormControl<string>;
  proveedorDePago: FormControl<ProveedorPago | null>;
  metodoDePago: FormControl<MetodoDePago | null>;

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

    this.proveedorDePago = new FormControl<ProveedorPago | null>(
      null,
      Validators.required
    );

    this.metodoDePago = new FormControl<MetodoDePago | null>(
      null,
      Validators.required
    );

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
      proveedorDePago: this.proveedorDePago,
      metodoDePago: this.metodoDePago,
      buyerFullName: this.buyerFullName,
      buyerEmail: this.buyerEmail,
      buyerDNI: this.buyerDNI,
      buyerPhone: this.buyerPhone
    });

    const uuid = this.route.snapshot.queryParamMap.get('uuidTrabajo');

    if (uuid) {
      this.uuidTrabajo.setValue(uuid);
    }
  }

  // PASO 1: continuar con el proveedor seleccionado.
  continuarProveedor(): void {

    if (this.proveedorDePago.invalid) {
      this.proveedorDePago.markAsTouched();
      return;
    }

    const proveedor = this.proveedorDePago.value!;

    this.metodosDisponibles = this.metodosPorProveedor[proveedor] ?? [];

    // Reiniciar el método si se cambia de proveedor.
    this.metodoDePago.reset(null);

    if (this.metodosDisponibles.length === 0) {
      return;
    }

    this.paso = 2;
  }

  // PASO 2: continuar con el método seleccionado.
  continuarMetodo(): void {

    if (this.metodoDePago.invalid) {
      this.metodoDePago.markAsTouched();
      return;
    }

    this.paso = 3;
  }

  // Volver al paso anterior.
  volver(): void {
    if (this.paso > 1) {
      this.paso--;
    }
  }

  // PASO 3: registrar el pago.

    registrar(): void {

      if (this.formulario.invalid) {
        this.formulario.markAllAsTouched();
        return;
      }

      if (this.cargando || this.pagoCreado) {
        return;
      }

      // Limpiar errores anteriores.
      this.errorRegistro = null;

      // Abrir una pestaña vacía mientras todavía existe
      // una acción directa del usuario.
      const ventanaPago = window.open('about:blank', '_blank');

      if (!ventanaPago) {
        this.errorRegistro =
          'El navegador bloqueó la nueva pestaña. Permití las ventanas emergentes e intentá nuevamente.';

        this.alertaService.error(this.errorRegistro);
        return;
      }

      const pago: PagoRequestModel = {
        uuidTrabajo: this.uuidTrabajo.value,
        proveedorDePago: this.proveedorDePago.value!,
        metodoDePago: this.metodoDePago.value!,
        buyerFullName: this.buyerFullName.value,
        buyerEmail: this.buyerEmail.value,
        buyerDNI: this.buyerDNI.value,
        buyerPhone: this.buyerPhone.value
      };

      this.cargando = true;

      this.pService.store(pago).subscribe({

        next: (respuesta: PagoResponseModel) => {

          console.log('Pago registrado correctamente', respuesta);

          this.cargando = false;

          if (!respuesta.checkoutUrl) {
            ventanaPago.close();

            this.errorRegistro =
              'No se recibió una URL para continuar con el pago.';

            this.alertaService.error(this.errorRegistro);
            return;
          }

          // Redirigir la nueva pestaña a Mercado Pago.
          ventanaPago.location.href = respuesta.checkoutUrl;

          // Mostrar confirmación en la pestaña original.
          this.pagoCreado = true;

          this.alertaService.exito(
            'Pago registrado correctamente. Se abrió Mercado Pago en otra pestaña.'
          );
        },

        error: (e) => {

          ventanaPago.close();

          this.cargando = false;

          if (e.status === 409) {
            this.errorRegistro =
              'Este trabajo ya tiene un pago registrado.';
          } else {
            this.errorRegistro =
              e.error?.message ||
              e.error?.mensaje ||
              'Ocurrió un error al registrar el pago. Intentá nuevamente.';
          }

          this.alertaService.error(this.errorRegistro!);
        }

      });
    }


  seleccionarProveedor(proveedor: ProveedorPago): void {

    this.formulario.get('proveedorDePago')?.setValue(proveedor);

    this.metodosDisponibles = this.metodosPorProveedor[proveedor] ?? [];

    // Reiniciamos el método si cambia el proveedor.
    this.formulario.get('metodoDePago')?.reset();
  }

  seleccionarMetodo(metodo: MetodoDePago): void {
    this.formulario.get('metodoDePago')?.setValue(metodo);
  }

  obtenerNombreProveedor(proveedor: ProveedorPago): string {

    const nombres: Record<ProveedorPago, string> = {
      [ProveedorPago.MERCADO_PAGO]: 'Mercado Pago'
    };

    return nombres[proveedor];
  }
}
