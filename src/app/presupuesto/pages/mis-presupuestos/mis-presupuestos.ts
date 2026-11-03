import { Component, inject, OnInit } from '@angular/core';
import { PresupuestoService } from '../../services/presupuesto';
import { PresupuestoModel } from '../../models/presupuesto-model';
import { EstadoPresupuesto } from '../../enum/estado-presupuesto';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-mis-presupuestos',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './mis-presupuestos.html',
  styleUrl: './mis-presupuestos.css',
})
export class MisPresupuestos implements OnInit{
  private presupuestoService = inject(PresupuestoService);

  // Permite utilizar el enum desde el HTML
  estados = EstadoPresupuesto;

  // Lista de presupuestos recibidos del backend
  presupuestos: PresupuestoModel[] = [];

  // Pestaña seleccionada
  tipoSeleccionado: 'CREADOS' | 'RECIBIDOS' = 'CREADOS';

  // Filtro de estado
  estadoSeleccionado: 'TODOS' | EstadoPresupuesto = 'TODOS';

  cargando = false;
  error = false;

  ngOnInit(): void {
    this.cargarPresupuestos();
  }

  // CARGAR PRESUPUESTOS
  cargarPresupuestos(): void {

    this.cargando = true;
    this.error = false;
    this.presupuestos = [];

    this.presupuestoService.obtenerMisPresupuestos(this.tipoSeleccionado)
      .subscribe({

        next: (datos) => {
          this.presupuestos = datos;
          this.cargando = false;
        },

        error: (err) => {
          console.error('Error al obtener los presupuestos', err);
          this.error = true;
          this.cargando = false;
        }

      });
  }

  // CAMBIAR ENTRE CREADOS Y RECIBIDOS
  cambiarTipo(tipo: 'CREADOS' | 'RECIBIDOS'): void {

    this.tipoSeleccionado = tipo;
    this.estadoSeleccionado = 'TODOS';

    this.cargarPresupuestos();
  }

  // FILTRAR POR ESTADO
  filtrarPorEstado(estado: 'TODOS' | EstadoPresupuesto): void {

    this.estadoSeleccionado = estado;
  }

  // OBTENER PRESUPUESTOS FILTRADOS
  get presupuestosFiltrados(): PresupuestoModel[] {

    if (this.estadoSeleccionado === 'TODOS') {
      return this.presupuestos;
    }

    return this.presupuestos.filter(
      presupuesto => presupuesto.estado === this.estadoSeleccionado
    );
  }

  // MENSAJE CUANDO NO HAY PRESUPUESTOS
  get mensajeSinPresupuestos(): string {

    if (this.tipoSeleccionado === 'CREADOS') {
      return '¡No tenés presupuestos a tu nombre!';
    }

    return '¡Todavía no tenés presupuestos recibidos!';
  }
}
