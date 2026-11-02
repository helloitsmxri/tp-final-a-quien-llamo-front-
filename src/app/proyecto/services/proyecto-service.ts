import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, switchMap, throwError } from 'rxjs';

import { TecnicoService } from '../../tecnico/services/tecnico';
import { PerfilTecnicoModel } from '../../tecnico/pages/perfil-tecnico/models/PerfilTecnicoModel';
import { HabilidadService } from '../../habilidad/services/habilidad';
import { EspecialidadService } from '../../especialidad/services/especialidad';
import { ProyectoModel } from '../models/ProyectoModel';
import {
  MAX_TEXTO,
  MIN_TEXTO,
  limpiarLinea,
  parsearProyectos,
  serializarProyectos,
} from '../utils/proyecto-texto';

/*los proyectos estan en un solo campo de texto del tecnico, asi q cada operacion
 (agregar/modificar/eliminar) trae el perfil actual, cambia la lista y guarda el
 texto completo con PUT /tecnicos/actualizar-perfil/{uuid}.
 */
@Injectable({ providedIn: 'root' })
export class ProyectoService {
  private http = inject(HttpClient);
  private tecnicoService = inject(TecnicoService);
  private habilidadService = inject(HabilidadService);
  private especialidadService = inject(EspecialidadService);

  private readonly url = 'http://localhost:8080/aquienllamo/tecnicos';

  // READ
  listar(uuidTecnico: string): Observable<ProyectoModel[]> {
    return this.tecnicoService.getPerfil(uuidTecnico) .pipe(map((perfil) => parsearProyectos(perfil.proyectos)));
  }

  // CREATE
  agregar(uuidTecnico: string, proyecto: ProyectoModel): Observable<ProyectoModel[]> {
    return this.modificarLista(uuidTecnico, (lista) => [...lista, this.limpiar(proyecto)]);
  }

  // UPDATE
  modificar(uuidTecnico: string, indice: number, proyecto: ProyectoModel): Observable<ProyectoModel[]> {
    return this.modificarLista(uuidTecnico, (lista) => {
      this.validarIndice(lista, indice);
      return lista.map((p, i) => (i === indice ? this.limpiar(proyecto) : p));
    });
  }

  // DELETE
  eliminar(uuidTecnico: string, indice: number): Observable<ProyectoModel[]> {
    return this.modificarLista(uuidTecnico, (lista) => {
      this.validarIndice(lista, indice);
      return lista.filter((_, i) => i !== indice);
    });
  }

  //internos
  private modificarLista(
    uuidTecnico: string,
    cambio: (lista: ProyectoModel[]) => ProyectoModel[],
  ): Observable<ProyectoModel[]> {
    return this.tecnicoService.getPerfil(uuidTecnico).pipe(
      switchMap((perfil) => {
        let nueva: ProyectoModel[];
        try {
          nueva = cambio(parsearProyectos(perfil.proyectos));
        } catch (e) {
          return throwError(() => e);
        }
        return this.guardar(uuidTecnico, perfil, nueva);
      }),
    );
  }

  private guardar(uuidTecnico: string, perfil: PerfilTecnicoModel, lista: ProyectoModel[]): Observable<ProyectoModel[]> {
    const texto = serializarProyectos(lista);
    if (texto.length < MIN_TEXTO) {
      return throwError(
        () =>
          new Error(
            `Los proyectos deben tener al menos ${MIN_TEXTO} caracteres en total. ` +
              'No se puede dejar la lista vacía.',
          ),
      );
    }
    if (texto.length > MAX_TEXTO) {
      return throwError(
        () => new Error(`Superaste el máximo de ${MAX_TEXTO} caracteres entre todos los proyectos.`),
      );
    }

    //el PUT del back exige uuids de habilidades y especialidades, pero el GET del perfil
    //solo devuelve nombres: los traducimos con los catalogos (GET publicos).
    return forkJoin({ habilidades: this.habilidadService.getAll(), especialidades: this.especialidadService.getAll(),
    }).pipe(
      switchMap(({ habilidades, especialidades }) => {
        const uuidHabilidades = perfil.habilidades.map(
          (n) => habilidades.find((h) => h.nombreHabilidad === n)?.uuid,
        );
        const uuidEspecialidades = perfil.especialidades.map(
          (n) => especialidades.find((e) => e.nombreEspecialidad === n)?.uuid,
        );

        //si algún nombre no se encuentra no seguimos: el PUT reemplaza las listas completas
        //y se perderían habilidades/especialidades del tecnico sin avisar.
        if (uuidHabilidades.includes(undefined) || uuidEspecialidades.includes(undefined)) {
          return throwError(
            () =>
              new Error(
                'No se pudieron identificar las habilidades o especialidades del perfil. ' +
                  'No se guardó nada.',
              ),
          );
        }

        return this.http.put<PerfilTecnicoModel>(`${this.url}/actualizar-perfil/${uuidTecnico}`, {
          cuit: perfil.cuit,
          descripcionTrabajo: perfil.descripcionTrabajo,
          proyectos: texto,
          uuidHabilidades,
          uuidEspecialidades,
        });
      }),
      map((respuesta) => parsearProyectos(respuesta.proyectos)),
    );
  }

  private limpiar(p: ProyectoModel): ProyectoModel {
    return { titulo: limpiarLinea(p.titulo), detalle: limpiarLinea(p.detalle) };
  }

  private validarIndice(lista: ProyectoModel[], indice: number): void {
    if (indice < 0 || indice >= lista.length) {
      throw new Error('El proyecto ya no existe. Recargá la página e intentá de nuevo.');
    }
  }
}