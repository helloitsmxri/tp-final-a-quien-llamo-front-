
import { Component, inject, Input, OnChanges } from '@angular/core';
import { PortfolioService } from '../../services/portfolio';
import { PortfolioUsuarioModel } from '../../models/portfolio-usuario';
import { EstadoVerificacion } from '../../enum/estado-verificacion';

@Component({
  selector: 'app-detalle-portfolio',
  templateUrl: './detalle-portfolio.html',
  styleUrl: './detalle-portfolio.css',
})
export class DetallePortfolio implements OnChanges {
  private servicio = inject(PortfolioService);

  @Input() uuidTecnico = '';

  readonly Estado = EstadoVerificacion;

  portfolios: PortfolioUsuarioModel[] = [];
  cargando = false;
  error: string | null = null;

  ngOnChanges(): void {
    this.cargar();
  }

  cargar(): void {
    if (!this.uuidTecnico) return;

    this.cargando = true;
    this.error = null;

    this.servicio.getByTecnico(this.uuidTecnico).subscribe({
      next: (lista) => {
        this.portfolios = lista;
        this.cargando = false;
      },
      error: (e) => {
        this.cargando = false;

        if (e?.status === 404) {
          this.portfolios = [];
          return;
        }

        this.error = e?.error?.message ?? 'No se pudieron cargar los portfolios.';
      },
    });
  }
}
