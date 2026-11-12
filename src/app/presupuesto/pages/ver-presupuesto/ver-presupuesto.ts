import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { PresupuestoService } from '../../services/presupuesto';
import { PresupuestoModel } from '../../models/presupuesto-model';
import { EstadoPresupuesto } from '../../enum/estado-presupuesto';

@Component({
  selector: 'app-ver-presupuesto',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './ver-presupuesto.html',
  styleUrl: './ver-presupuesto.css'
})
export class VerPresupuesto {

  private presupuestoService = inject(PresupuestoService);

  @Input({ required: true }) presupuesto!: PresupuestoModel;
  @Input() esTecnico = false;

  @Input() textoVolver = 'Volver a mis presupuestos';

  @Output() volver = new EventEmitter<void>();
  @Output() presupuestoActualizado = new EventEmitter<PresupuestoModel>();

  estados = EstadoPresupuesto;

  procesando = false;

  get estaPendiente(): boolean {
    return this.presupuesto.estado === EstadoPresupuesto.Pendiente;
  }

  aceptarPresupuesto(): void {
    if (this.esTecnico || !this.estaPendiente || this.procesando) {
      return;
    }

    this.procesando = true;

    this.presupuestoService.aceptarPresupuesto(this.presupuesto.uuid)
      .subscribe({
        next: () => {
          this.presupuesto.estado = EstadoPresupuesto.Aceptado;
          this.procesando = false;
          this.presupuestoActualizado.emit(this.presupuesto);
          alert('¡Aceptaste el presupuesto correctamente!');
        },
        error: (error) => {
          console.error('Error al aceptar el presupuesto:', error);
          this.procesando = false;
          alert('No se pudo aceptar el presupuesto. Intentá nuevamente.');
        }
      });
  }

  rechazarPresupuesto(): void {
    if (this.esTecnico || !this.estaPendiente || this.procesando) {
      return;
    }

    this.procesando = true;

    this.presupuestoService.rechazarPresupuesto(this.presupuesto.uuid)
      .subscribe({
        next: () => {
          this.presupuesto.estado = EstadoPresupuesto.Rechazado;
          this.procesando = false;
          this.presupuestoActualizado.emit(this.presupuesto);
          alert('El presupuesto fue rechazado.');
        },
        error: (error) => {
          console.error('Error al rechazar el presupuesto:', error);
          this.procesando = false;
          alert('No se pudo rechazar el presupuesto. Intentá nuevamente.');
        }
      });
  }

  cancelarPresupuesto(): void {
    if (!this.esTecnico || !this.estaPendiente || this.procesando) {
      return;
    }

    this.procesando = true;

    this.presupuestoService.cancelarPresupuesto(this.presupuesto.uuid)
      .subscribe({
        next: () => {
          this.presupuesto.estado = EstadoPresupuesto.Cancelado;
          this.procesando = false;
          this.presupuestoActualizado.emit(this.presupuesto);
          alert('El presupuesto fue cancelado.');
        },
        error: (error) => {
          console.error('Error al cancelar el presupuesto:', error);
          this.procesando = false;
          alert('No se pudo cancelar el presupuesto. Intentá nuevamente.');
        }
      });
  }

  volverAlListado(): void {
    this.volver.emit();
  }
}