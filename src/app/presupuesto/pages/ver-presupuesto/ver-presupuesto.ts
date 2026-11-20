import { Component, EventEmitter, inject, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { PresupuestoService } from '../../services/presupuesto';
import { PresupuestoModel } from '../../models/presupuesto-model';
import { EstadoPresupuesto } from '../../enum/estado-presupuesto';
import { AlertaService } from '../../../shared/alertas/service/alerta-service';
import { errorContext } from 'rxjs/internal/util/errorContext';

@Component({
  selector: 'app-ver-presupuesto',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './ver-presupuesto.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './ver-presupuesto.css'
})
export class VerPresupuesto {

  private presupuestoService = inject(PresupuestoService);
  private alertaService = inject(AlertaService);

  @Input({ required: true }) presupuesto!: PresupuestoModel;
  @Input() esTecnico = false;

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
          this.alertaService.exito('¡Aceptaste el presupuesto!');
        },
        error: (error) => {
          console.error('Error al aceptar el presupuesto:', error);
          this.procesando = false;
          this.alertaService.error('No se pudo aceptar el presupuesto. Intentá nuevamente.');
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
          this.alertaService.advertencia('El presupuesto fue rechazado.');
        },
        error: (error) => {
          console.error('Error al rechazar el presupuesto:', error);
          this.procesando = false;
          this.alertaService.error('No se pudo rechazar el presupuesto. Intentá nuevamente.');
        }
      });
  }

  cancelarPresupuesto(): void {
    if (!this.esTecnico || !this.estaPendiente || this.procesando) {
      return;
    }

    this.alertaService.confirmar(
      '¿Seguro que querés cancelar este presupuesto? Esta acción no se puede deshacer.',
    ()=> {
      this.procesando=true;

      this.presupuestoService.cancelarPresupuesto(this.presupuesto.uuid)
      .subscribe({
        next: ()=>{
          this.presupuesto.estado = EstadoPresupuesto.Cancelado;
          this.procesando= false;
          this.presupuestoActualizado.emit(this.presupuesto);
          this.alertaService.exito('El presupuesto fue cancelado con éxito.');
        },
        error:(err) =>{
          console.error('Error al cancelar el presupuesto:', err);
          this.procesando = false;
          this.alertaService.error('No se pudo cancelar el presupuesto. Intentá nuevamente.')
        }
      })

    })
    this.procesando = true;

    let mensaje ='';

    this.presupuestoService.cancelarPresupuesto(this.presupuesto.uuid)
      .subscribe({
        next: () => {
          if(this.presupuesto.estado === EstadoPresupuesto.Cancelado){
            mensaje = '¿Seguro que quiere cancelar este presupuesto? Esta acción no se puede deshacer.'
          }
          this.presupuesto.estado = EstadoPresupuesto.Cancelado;
          this.procesando = false;
          this.presupuestoActualizado.emit(this.presupuesto);
          this.alertaService.exito('El presupuesto fue cancelado.');
        },
        error: (error) => {
          console.error('Error al cancelar el presupuesto:', error);
          this.procesando = false;
          this.alertaService.error('No se pudo cancelar el presupuesto. Intentá nuevamente.');
        }
      });
  }

  volverAlListado(): void {
    this.volver.emit();
  }
}
