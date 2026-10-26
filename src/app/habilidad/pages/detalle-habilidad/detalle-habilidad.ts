import { Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges, OnChanges} from '@angular/core';
import { HabilidadModel } from '../../models/habilidad-model';
import { HabilidadService } from '../../services/habilidad';

@Component({
  imports: [],
  selector: 'app-detalle-habilidad',
  styleUrl: './detalle-habilidad.css',
  templateUrl: './detalle-habilidad.html',
})
export class DetalleHabilidad implements OnInit, OnChanges{
  private servicio = inject(HabilidadService);
  habilidades: HabilidadModel[] = [];
  seleccionadas = new Set<string>();

  @Input() nombresEspecialidades: string[] = []; //especialidades elegidas
  @Output() habilidadesSeleccionadas = new EventEmitter<string[]>(); //uuid

  ngOnInit(): void {
    this.servicio.getAll().subscribe({
      next: (data) => (this.habilidades = data),
      error: () => alert('Error al obtener las habilidades'),
    });
  }

  //si cambian las especialidades, saco las habilidades que ya no corresponden
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['nombresEspecialidades'] && !changes['nombresEspecialidades'].firstChange) {
      const validas = new Set(this.disponibles.map(h => h.uuid));
      this.seleccionadas = new Set([...this.seleccionadas].filter(u => validas.has(u)));
      this.habilidadesSeleccionadas.emit([...this.seleccionadas]);
    }
  }

  get disponibles(): HabilidadModel[] {
    return this.habilidades.filter(h =>
      (h.especialidades ?? []).some(e => this.nombresEspecialidades.includes(e))
    );
  }

  toggle(uuid: string, checked: boolean): void {
    checked ? this.seleccionadas.add(uuid) : this.seleccionadas.delete(uuid);
    this.habilidadesSeleccionadas.emit([...this.seleccionadas]);
  }
}
