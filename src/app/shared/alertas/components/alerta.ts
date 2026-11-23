import { Component, inject } from '@angular/core';
import { AlertaService } from '../service/alerta-service';

@Component({
  imports: [],
  selector: 'app-alerta',
  styleUrl: './alerta.css',
  templateUrl: './alerta.html',
})
export class Alerta {
  // inyección del servicio
  private alertaService = inject(AlertaService);

  // obtenemos las alertas
  alertas = this.alertaService.alertas;

  confirmar(id: number): void {
    this.alertaService.aceptarConfirmacion(id);
  }

  cancelar(id: number): void {
    this.alertaService.cancelarConfirmacion(id);
  }
  // cerrar la alerta
  cerrar (id:number):void{
    this.alertaService.cerrar(id);
  }
}
