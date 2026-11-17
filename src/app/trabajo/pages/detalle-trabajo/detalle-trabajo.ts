import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TrabajoService } from '../../services/trabajo';
import { TrabajoModel } from '../../models/trabajo-model';
import { AlertaService } from '../../../shared/alertas/service/alerta-service';

@Component({
  selector: 'app-detalle-trabajo',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './detalle-trabajo.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './detalle-trabajo.html',
})
export class DetalleTrabajo implements OnInit {

  private alertaService = inject(AlertaService);

  trabajo: TrabajoModel | undefined;

  cargando = true;
  error = false;

  constructor(
    public tService: TrabajoService,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (uuid) {
      this.detalleTrabajo(uuid);
    } else {
      this.cargando = false;
      this.error = true;
      this.alertaService.error('No se proporcionó un identificador de trabajo válido.');
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
        this.alertaService.error(
          e?.error?.mensaje || 'No se pudo cargar el detalle del trabajo.'
        );
      }
    });
  }
}