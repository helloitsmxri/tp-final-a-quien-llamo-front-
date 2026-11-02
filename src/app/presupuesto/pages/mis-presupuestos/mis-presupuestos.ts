import { Component, inject, OnInit } from '@angular/core';
import { PresupuestoService } from '../../services/presupuesto';
import { PresupuestoModel } from '../../models/presupuesto-model';
import { EstadoPresupuesto } from '../../enum/estado-presupuesto';

@Component({
  selector: 'app-mis-presupuestos',
  imports: [],
  templateUrl: './mis-presupuestos.html',
  styleUrl: './mis-presupuestos.css',
})
export class MisPresupuestos implements OnInit{
  private presupuestoService = inject(PresupuestoService);
  presupuestos : PresupuestoModel[] = [];
  tipoSeleccionado: 'CREADOS' | 'RECIBIDOS' = 'CREADOS';

  estadoSeleccionado = 'TODOS';

  cargando = false;
  error = false;

  ngOnInit() : void{

  }

  cargarPresupuestos () : void {
    this.cargando = true;
    this.error = false;
    
    this.presupuestoService.obtenerMisPresupuestos(this.tipoSeleccionado).subscribe({
      next : (datos) => {
        this.presupuestos = datos;
        this.cargando = false;
      },
      error : () => {
        this.error = true;
        this.cargando = false;
        alert('No se pudieron cargar los presupuestos.');
      }
    })
  }

  cambiarTipo (tipo : 'CREADOS' | 'RECIBIDOS') : void {
    this.tipoSeleccionado = tipo;
    this.estadoSeleccionado = 'TODOS';
    this.cargarPresupuestos();
  }

  filtrarPorEstado (estado : EstadoPresupuesto) : void{
    this.estadoSeleccionado = estado;
  }
}
