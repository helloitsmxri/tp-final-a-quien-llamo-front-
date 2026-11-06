
import { Component, inject, Input } from '@angular/core';
import { CertificacionModel } from '../../models/certificacion-model';
import { CertificacionService } from '../../services/certificacion';
import { EstadoVerificacion } from '../../enum/estado-verificacion';

@Component({
  selector: 'app-detalle-certificacion',
  templateUrl: './detalle-certificacion.html',
  styleUrl: './detalle-certificacion.css',
})
export class DetalleCertificacion {
  private servicio = inject(CertificacionService);

  @Input() uuidTecnico = '';

  readonly Estado = EstadoVerificacion;

  certificaciones: CertificacionModel[] = [];
  cargando = false;
  error: string | null = null;

  get certificacionesAprobadas(): CertificacionModel[] {
    return this.certificaciones.filter(
      c => c.estadoVerificacion === EstadoVerificacion.Aprobado
    );
  }

  ngOnChanges(): void {
    this.cargar();
  }

  cargar(): void {
    if (!this.uuidTecnico) return;

    this.cargando = true;
    this.error = null;

    this.servicio.getByTecnico(this.uuidTecnico).subscribe({
      next: (lista) => {
        this.certificaciones = lista;
        this.cargando = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'No se pudieron cargar los títulos.';
        this.cargando = false;
      },
    });
  }
}
