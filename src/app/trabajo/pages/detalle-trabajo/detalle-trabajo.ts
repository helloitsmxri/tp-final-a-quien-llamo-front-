
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrabajoService } from '../../services/trabajo';
import { ActivatedRoute } from '@angular/router';
import { TrabajoModel } from '../../models/trabajo-model';

@Component({
  selector: 'app-detalle-trabajo',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './detalle-trabajo.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './detalle-trabajo.html',
})
export class DetalleTrabajo implements OnInit {

  trabajo: TrabajoModel | undefined;

  cargando: boolean;
  error: boolean;

  constructor(
    public tService: TrabajoService,
    public route: ActivatedRoute
  ) {
    this.cargando = true;
    this.error = false;
  }

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (uuid) {
      this.detalleTrabajo(uuid);
    } else {
      this.cargando = false;
      this.error = true;
      console.error('No se proporcionó un UUID de trabajo.');
    }
  }

  detalleTrabajo(uuid: string): void {

    this.cargando = true;
    this.error = false;

    this.tService.getByUuid(uuid).subscribe({
      next: (data: TrabajoModel) => {
        this.trabajo = data;
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al obtener el detalle del trabajo:', e);
        this.error = true;
        this.cargando = false;
      }
    });
  }
}

