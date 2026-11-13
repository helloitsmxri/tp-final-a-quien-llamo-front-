import { Component, inject, OnInit } from '@angular/core';
import { TrabajoService } from '../../services/trabajo';
import { UsuarioService } from '../../../user/services/user';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TrabajoModel } from '../../models/trabajo-model';
import { EstadoTrabajo } from '../../enum/estado-trabajo';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-trabajo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-trabajo.html',
  styleUrl: './list-trabajo.css',
})
export class ListTrabajo implements OnInit {
  private usuarioService = inject(UsuarioService);

  trabajos: TrabajoModel[] = [];
  miUuid = '';
  cargando = true;
  error = false;
  actualizandoUuid: string | null = null;

  estados = EstadoTrabajo;

  constructor(
    public tService: TrabajoService,
    public root: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.usuarioService.getMyProfile().subscribe({
      next: (perfil) => {
        this.miUuid = perfil.uuid;
      },
      error: (err) => console.error('Error al obtener perfil:', err)
    });

    this.listarTrabajos();
  }

  esTecnicoDelTrabajo(trabajo: TrabajoModel): boolean {
    return !!this.miUuid && trabajo.uuidUsuarioTecnico === this.miUuid;
  }

    esClienteDelTrabajo(trabajo: TrabajoModel): boolean {
    return !!this.miUuid
      && trabajo.uuidCliente === this.miUuid
      && !this.esTecnicoDelTrabajo(trabajo);
  }

  estaPendiente(trabajo: TrabajoModel): boolean {
    return String(trabajo.estadoTrabajo) === EstadoTrabajo.Pendiente;
  }

  estaEnProceso(trabajo: TrabajoModel): boolean {
    const estado = String(trabajo.estadoTrabajo);
    return estado === EstadoTrabajo.En_proceso || estado === 'En_proceso';
  }

  estaFinalizado(trabajo: TrabajoModel): boolean {
    return String(trabajo.estadoTrabajo) === EstadoTrabajo.Finalizado;
  }

  formatearEstado(estado: EstadoTrabajo | string): string {
    return String(estado) === 'En_proceso' ? EstadoTrabajo.En_proceso : String(estado);
  }

  listarTrabajos(): void {
    const ruta = this.root.snapshot.routeConfig?.path;
    const uuid = this.root.snapshot.paramMap.get('uuid');
    const estado = this.root.snapshot.paramMap.get('estadoTrabajo');

    switch (ruta) {
      case 'trabajos/lista':
        this.tService.getAll().subscribe({
          next: (data) => { this.trabajos = data; this.cargando = false; },
          error: (e) => { console.error(e); this.error = true; this.cargando = false; }
        });
        break;

      case 'mis-trabajos':
        this.tService.getMyJobs().subscribe({
          next: (data) => { this.trabajos = data; this.cargando = false; },
          error: (e) => { console.error(e); this.error = true; this.cargando = false; }
        });
        break;

      case 'trabajos/estado/:estadoTrabajo':
        if (estado) {
          this.tService.getJobsByEstado(estado as EstadoTrabajo).subscribe({
            next: (data) => { this.trabajos = data; this.cargando = false; },
            error: (e) => { console.error(e); this.error = true; this.cargando = false; }
          });
        }
        break;

      case 'trabajos/cliente/:uuid':
        if (uuid) {
          this.tService.getJobsByCliente(uuid).subscribe({
            next: (data) => { this.trabajos = data; this.cargando = false; },
            error: (e) => { console.error(e); this.error = true; this.cargando = false; }
          });
        }
        break;

      case 'trabajos/tecnico/:uuid':
        if (uuid) {
          this.tService.getJobsByTecnico(uuid).subscribe({
            next: (data) => { this.trabajos = data; this.cargando = false; },
            error: (e) => { console.error(e); this.error = true; this.cargando = false; }
          });
        }
        break;

      default:
        this.cargando = false;
        this.error = true;
        console.error('Ruta de trabajos no reconocida.');
        break;
    }
  }

  cambiarEstado(trabajo: TrabajoModel, nuevoEstado: EstadoTrabajo): void {
    if (this.actualizandoUuid || !this.esTecnicoDelTrabajo(trabajo)) return;

    let mensaje = '';
    if (nuevoEstado === EstadoTrabajo.Finalizado) {
      mensaje = '¿Confirmás que este trabajo ya fue finalizado?';
    } else if (nuevoEstado === EstadoTrabajo.Cancelado) {
      mensaje = '¿Seguro que querés cancelar este trabajo? Esta acción no se puede deshacer.';
    } else {
      mensaje = '¿Iniciar este trabajo ahora?';
    }

    if (!confirm(mensaje)) return;

    this.actualizandoUuid = trabajo.uuid;

    // El backend espera 'En_proceso' con guion bajo como valor del enum Java
    const estadoParam = (nuevoEstado === EstadoTrabajo.En_proceso
      ? 'En_proceso'
      : nuevoEstado) as EstadoTrabajo;

    this.tService.changeEstado(trabajo.uuid, estadoParam).subscribe({
      next: (trabajoActualizado) => {
        const index = this.trabajos.findIndex((t) => t.uuid === trabajo.uuid);
        if (index !== -1) {
          this.trabajos[index] = trabajoActualizado;
        }
        this.actualizandoUuid = null;
      },
      error: (err) => {
        console.error('Error al cambiar estado del trabajo:', err);
        this.actualizandoUuid = null;
        alert(err?.error?.mensaje || 'No se pudo actualizar el estado del trabajo.');
      }
    });
  }
}