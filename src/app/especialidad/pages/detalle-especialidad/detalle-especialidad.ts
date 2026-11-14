import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { EspecialidadService } from '../../services/especialidad';
import { EspecialidadModel } from '../../models/especialidad-model';

@Component({
  imports: [],
  selector: 'app-detalle-especialidad',
  styleUrl: './detalle-especialidad.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './detalle-especialidad.html',
})
export class DetalleEspecialidad implements OnInit, OnChanges {
  private servicio = inject(EspecialidadService);
  especialidades: EspecialidadModel[] = [];
  seleccionadas = new Set<string>();// uuids

  @Input() nombresPermitidos: string[] = [];// especialidades de los rubros elegidos
  @Output() especialidadesSeleccionadas = new EventEmitter<EspecialidadModel[]>();

  ngOnInit(): void {
    this.servicio.getAll().subscribe({
      next: (data) => (this.especialidades = data),
      error: () => alert('Error al obtener las especialidades'),
    });
  }

  // si cambian los rubros, se conservan las elegidas que siguen disponibles
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nombresPermitidos'] && !changes['nombresPermitidos'].firstChange) {
      const validas = new Set(this.disponibles.map((e) => e.uuid));
      this.seleccionadas = new Set([...this.seleccionadas].filter((u) => validas.has(u)));
      this.emitir();
    }
  }

  get disponibles(): EspecialidadModel[] {
    return this.especialidades.filter((e) => this.nombresPermitidos.includes(e.nombreEspecialidad));
  }

  toggle(uuid: string, checked: boolean): void {
    checked ? this.seleccionadas.add(uuid) : this.seleccionadas.delete(uuid);
    this.emitir();
  }

  private emitir(): void {
    this.especialidadesSeleccionadas.emit(
      this.especialidades.filter((e) => this.seleccionadas.has(e.uuid))
    );
  }
}