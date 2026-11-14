import { Component, EventEmitter, Input, OnInit, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { forkJoin } from 'rxjs';
import { RubroService } from '../rubro/services/rubro';
import { EspecialidadService } from '../especialidad/services/especialidad';
import { HabilidadService } from '../habilidad/services/habilidad';
import { RubroModel } from '../rubro/models/rubro-model';
import { EspecialidadModel } from '../especialidad/models/especialidad-model';
import { HabilidadModel } from '../habilidad/models/habilidad-model';

// Reemplaza a app-detalle-rubro + app-detalle-especialidad + app-detalle-habilidad:
// rubros (chips) -> especialidades de cada rubro elegido -> habilidades de cada especialidad elegida.
@Component({
  selector: 'app-selector-servicios',
  imports: [],
  templateUrl: './selector-servicios.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './selector-servicios.css',
})
export class SelectorServicios implements OnInit {
  private servicioRubros = inject(RubroService);
  private servicioEspecialidades = inject(EspecialidadService);
  private servicioHabilidades = inject(HabilidadService);

  rubros: RubroModel[] = [];
  cargando = true;
  falloCarga = false;

  rubrosSel = new Set<string>();         // uuidRubro
  especialidadesSel = new Set<string>(); // uuid especialidad
  habilidadesSel = new Set<string>();    // uuid habilidad

  // se arman una sola vez para que el template no reciba arrays nuevos en cada ciclo
  private especialidades: EspecialidadModel[] = [];
  private especialidadesPorRubro = new Map<string, EspecialidadModel[]>();
  private habilidadesPorEspecialidad = new Map<string, HabilidadModel[]>();

  // para editar: nombres de lo que el técnico ya tiene (se marcan al cargar)
  @Input() especialidadesIniciales: string[] = [];
  @Input() habilidadesIniciales: string[] = [];

  @Output() rubrosSeleccionados = new EventEmitter<RubroModel[]>();
  @Output() especialidadesSeleccionadas = new EventEmitter<EspecialidadModel[]>();
  @Output() habilidadesSeleccionadas = new EventEmitter<string[]>(); // uuids

  ngOnInit(): void {
    forkJoin({
      rubros: this.servicioRubros.getRubros(),
      especialidades: this.servicioEspecialidades.getAll(),
      habilidades: this.servicioHabilidades.getAll(),
    }).subscribe({
      next: ({ rubros, especialidades, habilidades }) => {
        this.rubros = rubros;
        this.especialidades = especialidades;

        rubros.forEach((r) => {
          const nombres = r.especialidades ?? [];
          this.especialidadesPorRubro.set(
            r.uuidRubro,
            especialidades.filter((e) => nombres.includes(e.nombreEspecialidad))
          );
        });
        especialidades.forEach((e) => {
          this.habilidadesPorEspecialidad.set(
            e.uuid,
            habilidades.filter((h) => (h.especialidades ?? []).includes(e.nombreEspecialidad))
          );
        });
        this.aplicarIniciales();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.falloCarga = true;
      },
    });
  }

  get rubrosElegidos(): RubroModel[] {
    return this.rubros.filter((r) => this.rubrosSel.has(r.uuidRubro));
  }

  especialidadesDe(rubro: RubroModel): EspecialidadModel[] {
    return this.especialidadesPorRubro.get(rubro.uuidRubro) ?? [];
  }

  habilidadesDe(especialidad: EspecialidadModel): HabilidadModel[] {
    return this.habilidadesPorEspecialidad.get(especialidad.uuid) ?? [];
  }

  // cuantas especialidades elegidas tiene un rubro (para el numerito del chip)
  cantidadElegidas(rubro: RubroModel): number {
    return this.especialidadesDe(rubro).filter((e) => this.especialidadesSel.has(e.uuid)).length;
  }

  toggleRubro(uuid: string): void {
    this.rubrosSel.has(uuid) ? this.rubrosSel.delete(uuid) : this.rubrosSel.add(uuid);
    this.limpiarYEmitir();
  }

  toggleEspecialidad(uuid: string): void {
    this.especialidadesSel.has(uuid) ? this.especialidadesSel.delete(uuid) : this.especialidadesSel.add(uuid);
    this.limpiarYEmitir();
  }

  toggleHabilidad(uuid: string): void {
    this.habilidadesSel.has(uuid) ? this.habilidadesSel.delete(uuid) : this.habilidadesSel.add(uuid);
    this.limpiarYEmitir();
  }

  // marca lo que el técnico ya tenía: especialidades -> rubros que las contienen -> habilidades
  private aplicarIniciales(): void {
    if (!this.especialidadesIniciales.length) return;

    const elegidas = this.especialidades.filter((e) =>
      this.especialidadesIniciales.includes(e.nombreEspecialidad)
    );
    elegidas.forEach((e) => this.especialidadesSel.add(e.uuid));

    this.rubros.forEach((r) => {
      if (this.especialidadesDe(r).some((e) => this.especialidadesSel.has(e.uuid))) {
        this.rubrosSel.add(r.uuidRubro);
      }
    });

    elegidas.forEach((e) =>
      this.habilidadesDe(e).forEach((h) => {
        if (this.habilidadesIniciales.includes(h.nombreHabilidad)) this.habilidadesSel.add(h.uuid);
      })
    );

    this.limpiarYEmitir();
  }

  // saca lo que ya no corresponde (rubro desmarcado -> sus especialidades -> sus habilidades)
  private limpiarYEmitir(): void {
    const especialidadesValidas = new Set(
      this.rubrosElegidos.flatMap((r) => this.especialidadesDe(r)).map((e) => e.uuid)
    );
    this.especialidadesSel = new Set([...this.especialidadesSel].filter((u) => especialidadesValidas.has(u)));

    const elegidas = this.especialidades.filter((e) => this.especialidadesSel.has(e.uuid));
    const habilidadesValidas = new Set(
      elegidas.flatMap((e) => this.habilidadesDe(e)).map((h) => h.uuid)
    );
    this.habilidadesSel = new Set([...this.habilidadesSel].filter((u) => habilidadesValidas.has(u)));

    this.rubrosSeleccionados.emit(this.rubrosElegidos);
    this.especialidadesSeleccionadas.emit(elegidas);
    this.habilidadesSeleccionadas.emit([...this.habilidadesSel]);
  }
}