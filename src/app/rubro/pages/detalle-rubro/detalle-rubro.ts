import { Component, EventEmitter, inject, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import { RubroService } from '../../services/rubro';
import { RubroModel } from '../../models/rubro-model';

@Component({
  imports: [],
  selector: 'app-detalle-rubro',
  styleUrl: './detalle-rubro.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './detalle-rubro.html',
})
export class DetalleRubro implements OnInit {
  private servicioRubros = inject(RubroService);
  rubros: RubroModel[] = [];
  seleccionados = new Set<string>();   // uuidRubro

  @Output() rubrosSeleccionados = new EventEmitter<RubroModel[]>();

  ngOnInit(): void {
    this.servicioRubros.getRubros().subscribe({
      next: (data) => { this.rubros = data; },
      error: () => { alert('Error al obtener rubros.'); }
    });
  }

  toggle(uuid: string, checked: boolean): void {
    checked ? this.seleccionados.add(uuid) : this.seleccionados.delete(uuid);
    this.rubrosSeleccionados.emit(this.rubros.filter((r) => this.seleccionados.has(r.uuidRubro)));
  }
}