
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TecnicoListadoModel } from '../../models/TecnicoListado';
import { TecnicoService } from '../../services/tecnico';
import { RubroService } from '../../../rubro/services/rubro';
import { RubroModel } from '../../../rubro/models/rubro-model';

@Component({
  selector: 'app-list-tecnicos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list-tecnicos.html',
  styleUrl: './list-tecnicos.css'
})

export class ListTecnicos implements OnInit {

  private tecnicoService = inject(TecnicoService);
  private rubroService = inject(RubroService);
  private router = inject(Router);

  tecnicos: TecnicoListadoModel[] = [];
  textoBusqueda = '';

  rubros: RubroModel[] = [];
  rubroElegido: RubroModel | null = null;
  especialidadElegida: string | null = null;

  cargando = false;
  error = '';

  ngOnInit(): void {
    this.cargarTecnicos();
    this.cargarRubros();
  }

  cargarTecnicos(): void {
    this.cargando = true;
    this.error = '';

    this.tecnicoService.getTecnicosListado().subscribe({
      next: (datos: TecnicoListadoModel[]) => {
        this.tecnicos = datos;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar técnicos:', err);
        this.error = 'No se pudieron cargar los técnicos.';
        this.cargando = false;
      }
    });
  }

  private cargarRubros(): void {
    this.rubroService.getRubros().subscribe({
      next: (datos: RubroModel[]) => (this.rubros = datos),
      error: (err: any) => console.error('Error al cargar rubros:', err),
    });
  }

  elegirRubroPorUuid(uuid: string): void {
    this.elegirRubro(this.rubros.find(r => r.uuidRubro === uuid) ?? null);
  }

  elegirRubro(rubro: RubroModel | null): void {
    this.rubroElegido = rubro;

    if (this.especialidadElegida && !this.especialidadesDisponibles.some(
      e => this.normalizar(e) === this.normalizar(this.especialidadElegida!))) {
      this.especialidadElegida = null;
    }
  }

  elegirEspecialidad(nombre: string | null): void {
    this.especialidadElegida = nombre || null;
  }

  get especialidadesDisponibles(): string[] {
    if (this.rubroElegido) {
      return this.rubroElegido.especialidades ?? [];
    }

    const todas = new Set(this.rubros.flatMap(r => r.especialidades ?? []));
    return [...todas].sort((a, b) => a.localeCompare(b, 'es'));
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.rubroElegido = null;
    this.especialidadElegida = null;
  }

  get hayFiltros(): boolean {
    return !!this.textoBusqueda.trim() ||
      !!this.rubroElegido ||
      !!this.especialidadElegida;
  }

  private normalizar(texto: string): string {
    return texto.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  }

  private rubrosDe(tecnico: TecnicoListadoModel): string[] {
    const suyas = new Set(
      (tecnico.especialidades ?? []).map(e => this.normalizar(e))
    );

    return this.rubros
      .filter(r => (r.especialidades ?? []).some(e => suyas.has(this.normalizar(e))))
      .map(r => r.nombreRubro);
  }

  get tecnicosFiltrados(): TecnicoListadoModel[] {
    const texto = this.normalizar(this.textoBusqueda);

    return this.tecnicos.filter(tecnico => {
      const especialidades = (tecnico.especialidades ?? []).map(e => this.normalizar(e));

      if (this.rubroElegido) {
        const delRubro = new Set(
          (this.rubroElegido.especialidades ?? []).map(e => this.normalizar(e))
        );

        if (!especialidades.some(e => delRubro.has(e))) return false;
      }

      if (this.especialidadElegida) {
        if (!especialidades.includes(this.normalizar(this.especialidadElegida))) {
          return false;
        }
      }

      if (!texto) return true;

      return [
        tecnico.nombre,
        tecnico.apellido,
        tecnico.descripcionTrabajo,
        ...(tecnico.habilidades ?? []),
        ...(tecnico.especialidades ?? []),
        ...this.rubrosDe(tecnico)
      ]
        .filter(dato => dato != null)
        .some(dato => this.normalizar(dato).includes(texto));
    });
  }

  private imagenesEstrellas: { [key: number]: string } = {
    0.5: 'media-estrella',
    1: 'una-estrella',
    1.5: 'una-estrella-y-media',
    2: 'dos-estrellas',
    2.5: 'dos-estrellas-y-media',
    3: 'tres-estrellas',
    3.5: 'tres-estrellas-y-media',
    4: 'cuatro-estrellas',
    4.5: 'cuatro-estrellas-y-media',
    5: 'cinco-estrellas'
  };

  promedioDe(tecnico: TecnicoListadoModel): number {
    return (tecnico as TecnicoListadoModel & { promedio?: number }).promedio ?? 0;
  }

  imagenEstrellasDe(tecnico: TecnicoListadoModel): string | null {
    const promedio = this.promedioDe(tecnico);

    if (promedio <= 0) {
      return null;
    }

    const redondeado = Math.min(5, Math.max(0.5, Math.round(promedio * 2) / 2));

    return `/ilustraciones/rating/${this.imagenesEstrellas[redondeado]}.png`;
  }

  verPerfil(uuid: string): void {
    this.router.navigate(['/perfil-tecnico', uuid]);
  }

  obtenerFoto(tecnico: TecnicoListadoModel): string | null {
    if (!tecnico.fotoBase64 || !tecnico.tipoImagen) {
      return null;
    }

    return `data:${tecnico.tipoImagen};base64,${tecnico.fotoBase64}`;
  }
}
