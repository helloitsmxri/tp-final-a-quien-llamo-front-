import { Component, inject } from '@angular/core';
import { PortfolioUsuarioModel } from '../../models/portfolio-usuario';
import { TecnicoService } from '../../../tecnico/services/tecnico';
import { PortfolioService } from '../../services/portfolio';
import { EstadoVerificacion } from '../../enum/estado-verificacion';


@Component({
  selector: 'app-portfolio-list',
  imports: [],
  templateUrl: './portfolio-list.html',
  styleUrl: './portfolio-list.css',
})
export class PortfolioList {
  private tecnicoService = inject(TecnicoService);
  private servicio = inject(PortfolioService);

  readonly Estado = EstadoVerificacion;

  portfolios: PortfolioUsuarioModel[] = [];
  cargando = false;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarPortfolios();
  }

  cargarPortfolios(): void {
    this.cargando = true;
    this.error = null;

    this.tecnicoService.getMiPerfil().subscribe({
      next: (tecnico) => {
        this.servicio.getByTecnico(tecnico.uuid).subscribe({
          next: (datos) => {
            this.portfolios = datos ?? [];
            this.cargando = false;
          },
          error: (e) => {
            if (e?.status === 404) {
              this.portfolios = [];
              this.cargando = false;
              return;
            }

            console.error('Error al cargar los portfolios:', e);
            this.error = 'No se pudieron cargar tus portfolios.';
            this.cargando = false;
          },
        });
      },
      error: (e) => {
        console.error('Error al obtener el perfil del técnico:', e);
        this.error = 'No se pudo identificar al técnico autenticado.';
        this.cargando = false;
      },
    });
  }

  tieneArchivo(p: PortfolioUsuarioModel): boolean {
    return !!p.tipoArchivo && p.tipoArchivo !== 'enlace';
  }
}
