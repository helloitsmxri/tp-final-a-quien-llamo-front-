import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { PresupuestoService } from '../../services/presupuesto';
import { PresupuestoModel } from '../../models/presupuesto-model';
import { PresupuestoRequestModel } from '../../models/presupuesto-request-model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-crear-presupuesto',
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './crear-presupuesto.html',
  styleUrl: './crear-presupuesto.css',
})
export class CrearPresupuesto {

  private fb = inject(FormBuilder);
  private presupuestoService = inject(PresupuestoService);

  // Recibimos el uuid del chat desde el componente que nos utiliza.
  @Input({ required: true }) uuidChat!: string;

  // Avisamos que se creó el presupuesto.
  @Output() presupuestoCreado = new EventEmitter<PresupuestoModel>();

  // Avisamos que se quiere cerrar el formulario.
  @Output() cerrar = new EventEmitter<void>();

  enviando = false;

  // CREAR UN TRABAJO ESPECÍFICO
  private crearDetalle(): FormGroup {
    return this.fb.group({
      descripcion: ['',[Validators.required,Validators.minLength(3),Validators.maxLength(150)]],
      precioUnitario: [0, [Validators.required,Validators.min(0.01)]],
      cantidad: [1,[Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]]
    });
  }

  // FORMULARIO PRINCIPAL
  formulario = this.fb.group({
    nombreProyecto: ['', [Validators.required,Validators.minLength(3),Validators.maxLength(80)]],
    observaciones: ['', [Validators.maxLength(2000)]],
    descuentoPorcentaje: [0, [Validators.required,Validators.min(0),Validators.max(100)]],
    detalles: this.fb.array([this.crearDetalle()])
  });

  // OBTENER LOS TRABAJOS DEL FORMULARIO
  get detalles(): FormArray {
    return this.formulario.get('detalles') as FormArray;
  }

  // OBTENER LOS CONTROLES DE LOS TRABAJOS
  get controlesDetalles(): AbstractControl[] {
    return this.detalles.controls;
  }

  // AGREGAR OTRO TRABAJO
  agregarDetalles(): void {
    this.detalles.push(this.crearDetalle());
  }

  // ELIMINAR UN TRABAJO
  eliminarDetalle(idx: number): void {

    // Siempre debe quedar al menos un trabajo.
    if (this.detalles.length > 1) {
      this.detalles.removeAt(idx);
    }

  }

  // CALCULAR SUBTOTAL
  get subTotal(): number {

    let total = 0;

    this.detalles.controls.forEach(detalle => {

      const precio = Number(detalle.get('precioUnitario')?.value) || 0;
      const cantidad = Number(detalle.get('cantidad')?.value) || 0;

      total += precio * cantidad;

    });

    return this.redondear(total);
  }

  // CALCULAR MONTO DEL DESCUENTO
  get montoDescuento(): number {

    const porcentaje = Number(this.formulario.get('descuentoPorcentaje')?.value) || 0;

    return this.redondear(this.subTotal * porcentaje / 100);
  }

  // CALCULAR TOTAL FINAL
  get totalFinal(): number {
    return this.redondear(this.subTotal - this.montoDescuento);
  }

  // CALCULAR TOTAL DE UN TRABAJO
  calcularTotalDetalle(indice: number): number {

    const precio = Number(this.obtenerControlDetalle(indice, 'precioUnitario')?.value) || 0;

    const cantidad = Number(this.obtenerControlDetalle(indice, 'cantidad')?.value) || 0;

    return this.redondear(precio * cantidad);
  }

  // REDONDEAR A DOS DECIMALES
  private redondear(valor: number): number {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
  }

  // MOSTRAR MENSAJES DE ERROR
  mensajeError(control: AbstractControl | null): string {

    if (!control || !control.touched) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('minlength')) {
      return 'La cantidad de caracteres es insuficiente.';
    }

    if (control.hasError('maxlength')) {
      return 'Superaste la cantidad máxima de caracteres.';
    }

    if (control.hasError('pattern')) {
      return 'La cantidad debe ser un número entero.';
    }

    if (control.hasError('min')) {

      const minimo = control.getError('min').min;

      // Primero los casos especiales...
      if (minimo === 1) {
        return 'La cantidad debe ser al menos 1.';
      }

      if (minimo === 0) {
        return 'El descuento no puede ser negativo.';
      }

      // ...y al final el mensaje general (precio, mínimo 0.01).
      return 'El valor debe ser mayor a cero.';
    }

    if (control.hasError('max')) {
      return 'El descuento no puede superar el 100%.';
    }

    return '';
  }

  // OBTENER UN CONTROL DE UN TRABAJO
  obtenerControlDetalle(indice: number, campo: string): AbstractControl | null {

    return this.detalles.at(indice)?.get(campo) ?? null;

  }

  // COMPROBAR SI UN CAMPO ES INVÁLIDO
  campoInvalido(control: AbstractControl | null): boolean {

    return !!control &&
      control.invalid &&
      control.touched;

  }

  // GUARDAR PRESUPUESTO
  guardarPresupuesto(): void {

    // Comprobar que el formulario sea válido.
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    // Comprobar que exista un chat.
    if (!this.uuidChat) {
      alert('No se pudo identificar la conversación.');
      return;
    }

    // Evitar envíos repetidos.
    if (this.enviando) {
      return;
    }

    // Obtener los datos del formulario.
    const datos = this.formulario.getRawValue();

    // Preparar el objeto que espera el backend.
    const presupuesto: PresupuestoRequestModel = {
      nombreProyecto: String(datos.nombreProyecto).trim(),
      observaciones: String(datos.observaciones ?? '').trim(),
      descuentoPorcentaje: Number(datos.descuentoPorcentaje),
      detalles: datos.detalles.map(detalle => ({ descripcion: String(detalle['descripcion']).trim(), precioUnitario: Number(detalle['precioUnitario']), cantidad: Number(detalle['cantidad'])}))
    };

    this.enviando = true;

    // Enviar el presupuesto al backend.
    this.presupuestoService.crearPresupuesto(this.uuidChat, presupuesto).subscribe({
      next: (respuesta) => {this.enviando = false; alert('¡El presupuesto se creó correctamente!');
                            this.presupuestoCreado.emit(respuesta)},
      error: () => {        this.enviando = false;
                            alert('No se pudo crear el presupuesto. Intentá nuevamente.')}});
    }

  // CERRAR FORMULARIO
  cerrarFormulario(): void {
    this.cerrar.emit();
  }
}