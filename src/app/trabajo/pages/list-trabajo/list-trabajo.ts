
import { Component, OnInit } from '@angular/core';
import { TrabajoService } from '../../services/trabajo';
import { ActivatedRoute } from '@angular/router';
import { TrabajoModel } from '../../models/trabajo-model';
import { EstadoTrabajo } from '../../enum/estado-trabajo';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-trabajo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-trabajo.html',
  styleUrl: './list-trabajo.css',
})
export class ListTrabajo implements OnInit {

  trabajos: TrabajoModel[];

  cargando: boolean;
  error: boolean;

  constructor(
    public tService: TrabajoService,
    public root: ActivatedRoute
  ) {
    this.trabajos = [];
    this.cargando = true;
    this.error = false;
  }

  ngOnInit(): void {
    this.listarTrabajos();
  }

  listarTrabajos(): void {

    const ruta = this.root.snapshot.routeConfig?.path;

    const uuid = this.root.snapshot.paramMap.get('uuid');
    const estado = this.root.snapshot.paramMap.get('estadoTrabajo');

    switch (ruta) {

      // LISTAR TODOS LOS TRABAJOS
      case 'trabajos/lista':
        this.tService.getAll().subscribe({
          next: (data) => {
            this.trabajos = data;
            this.cargando = false;
          },
          error: (e) => {
            console.error(e);
            this.error = true;
            this.cargando = false;
          }
        });
        break;

      // LISTAR MIS TRABAJOS
      case 'mis-trabajos':
        this.tService.getMyJobs().subscribe({
          next: (data) => {
            this.trabajos = data;
            this.cargando = false;
          },
          error: (e) => {
            console.error(e);
            this.error = true;
            this.cargando = false;
          }
        });
        break;

      // FILTRAR POR ESTADO
      case 'trabajos/estado/:estadoTrabajo':
        if (estado) {
          this.tService.getJobsByEstado(estado as EstadoTrabajo).subscribe({
            next: (data) => {
              this.trabajos = data;
              this.cargando = false;
            },
            error: (e) => {
              console.error(e);
              this.error = true;
              this.cargando = false;
            }
          });
        }
        break;

      // TRABAJOS DE UN CLIENTE
      case 'trabajos/cliente/:uuid':
        if (uuid) {
          this.tService.getJobsByCliente(uuid).subscribe({
            next: (data) => {
              this.trabajos = data;
              this.cargando = false;
            },
            error: (e) => {
              console.error(e);
              this.error = true;
              this.cargando = false;
            }
          });
        }
        break;

      // TRABAJOS DE UN TÉCNICO
      case 'trabajos/tecnico/:uuid':
        if (uuid) {
          this.tService.getJobsByTecnico(uuid).subscribe({
            next: (data) => {
              this.trabajos = data;
              this.cargando = false;
            },
            error: (e) => {
              console.error(e);
              this.error = true;
              this.cargando = false;
            }
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
}

