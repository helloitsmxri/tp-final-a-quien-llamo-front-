import { Component, inject, Input, OnChanges } from '@angular/core';
import { PortfolioService } from '../../services/portfolio';
import { PortfolioUsuarioModel } from '../../models/portfolio-usuario';
import { EstadoVerificacion } from '../../enum/estado-verificacion';

@Component({
  imports: [],
  selector: 'app-detalle-portfolio',
  styleUrl: './detalle-portfolio.css',
  templateUrl: './detalle-portfolio.html',
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

  // público para poder recargar después de crear uno (ver (creada) del formulario)
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
        // el back responde 404 cuando todavía no hay ninguno: no es un error para mostrar
        if (e?.status === 404) {
          this.portfolios = [];
          return;
        }
        this.error = e?.error?.message ?? 'No se pudieron cargar tus portfolios.';
      },
    });
  }

  // cuando solo se mandó un link, el front guarda tipoArchivo = 'enlace'
  tieneArchivo(p: PortfolioUsuarioModel): boolean {
    return !!p.tipoArchivo && p.tipoArchivo !== 'enlace';
  }
}