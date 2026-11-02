import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import {EspecialidadModel} from "../../models/especialidad-model";
import { EspecialidadService } from '../../services/especialidad';
@Component({
  imports: [],
  selector: 'app-detalle-especialidad',
  styleUrl: './detalle-especialidad.css',
  templateUrl: './detalle-especialidad.html',
})
export class DetalleEspecialidad {
  private servicio = inject(EspecialidadService);
  especialidades: EspecialidadModel[] = [];
  seleccionadas = new Set<string>();           // uuids

  @Input() nombresPermitidos: string[] = [];   // especialidades del rubro elegido
  @Output() especialidadesSeleccionadas = new EventEmitter<EspecialidadModel[]>();

  ngOnInit(): void {
    this.servicio.getAll().subscribe({
      next: (data) => (this.especialidades = data),
      error: () => alert('Error al obtener las especialidades'),
    });
  }

  //si cambia el rubro, se limpia la selección
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nombresPermitidos'] && !changes['nombresPermitidos'].firstChange) {
      this.seleccionadas.clear();
      this.emitir();
    }
  }

  get disponibles(): EspecialidadModel[] {
    return this.especialidades.filter(e => this.nombresPermitidos.includes(e.nombreEspecialidad));
  }

  toggle(uuid: string, checked: boolean): void {
    checked ? this.seleccionadas.add(uuid) : this.seleccionadas.delete(uuid);
    this.emitir();
  }

  private emitir(): void {
    this.especialidadesSeleccionadas.emit(
      this.especialidades.filter(e => this.seleccionadas.has(e.uuid))
    );
  }
}
