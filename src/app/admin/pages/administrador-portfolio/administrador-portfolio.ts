
import { Component, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';

import { PortfolioService } from '../../../portfolio/services/portfolio';
import { PortfolioAdminModel } from '../../../portfolio/models/portfolio-admin';
import { EstadoVerificacion } from '../../../portfolio/enum/estado-verificacion';

type FiltroPortfolio = 'TODAS' | 'PENDIENTES' | 'APROBADAS' | 'RECHAZADAS';

@Component({
  selector: 'app-administrador-portfolios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './administrador-portfolio.html',
  styleUrl: './administrador-portfolio.css'
})
export class AdministradorPortfolio implements OnInit {

  private portfolioService = inject(PortfolioService);
  private sanitizer = inject(DomSanitizer);

  estadoVerificacion = EstadoVerificacion;

  portfolios: PortfolioAdminModel[] = [];
  portfolioSeleccionado: PortfolioAdminModel | null = null;

  filtroActual: FiltroPortfolio = 'TODAS';
  busqueda = '';

  motivoAdmin = '';

  buscando = false;
  procesandoAccion = false;

  mensaje = '';
  errorMensaje = '';

  mostrarImagen = false;

  ngOnInit(): void {
    this.cargarPortfolios();
  }

  cargarPortfolios(): void {
    this.buscando = true;
    this.errorMensaje = '';

    this.portfolioService.getAllAdmin().subscribe({
      next: (datos) => {
        this.portfolios = datos;

        if (this.portfolioSeleccionado) {
          this.portfolioSeleccionado =
            datos.find(p => p.uuid === this.portfolioSeleccionado?.uuid) ?? null;

          if (this.portfolioSeleccionado) {
            this.motivoAdmin = this.portfolioSeleccionado.notasAdmin ?? '';
          }
        }

        this.buscando = false;
      },
      error: (error) => {
        console.error('Error al cargar portfolios:', error);
        this.errorMensaje = 'No se pudieron cargar los portfolios.';
        this.buscando = false;
      }
    });
  }

  cambiarFiltro(filtro: FiltroPortfolio): void {
    this.filtroActual = filtro;
  }

  get portfoliosFiltrados(): PortfolioAdminModel[] {
    const texto = this.busqueda.toLowerCase().trim();

    return this.portfolios.filter(portfolio => {

      let coincideEstado = true;

      if (this.filtroActual === 'PENDIENTES') {
        coincideEstado =
          portfolio.estadoVerificacion === EstadoVerificacion.Pendiente;
      } else if (this.filtroActual === 'APROBADAS') {
        coincideEstado =
          portfolio.estadoVerificacion === EstadoVerificacion.Aprobado;
      } else if (this.filtroActual === 'RECHAZADAS') {
        coincideEstado =
          portfolio.estadoVerificacion === EstadoVerificacion.Rechazado;
      }

      const coincideBusqueda =
        portfolio.titulo?.toLowerCase().includes(texto) ||
        portfolio.nombreTecnico?.toLowerCase().includes(texto) ||
        portfolio.nombreEspecialidad?.toLowerCase().includes(texto) ||
        portfolio.uuid?.toLowerCase().includes(texto);

      return coincideEstado && coincideBusqueda;
    });
  }

  seleccionarPortfolio(portfolio: PortfolioAdminModel): void {
  this.portfolioSeleccionado = portfolio;
  this.motivoAdmin = portfolio.notasAdmin ?? '';

  console.log('DATOS DEL PORTFOLIO:', {
    titulo: portfolio.titulo,
    enlaceExterno: portfolio.enlaceExterno,
    tipoArchivo: portfolio.tipoArchivo,
    tieneArchivo: !!portfolio.archivoAdjunto,
    longitudArchivo: portfolio.archivoAdjunto?.length,
    inicioArchivo: portfolio.archivoAdjunto?.substring(0, 50)
  });

  this.mensaje = '';
  this.errorMensaje = '';
}

  esPendiente(portfolio: PortfolioAdminModel): boolean {
    return portfolio.estadoVerificacion === EstadoVerificacion.Pendiente;
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) {
      return 'No disponible';
    }

    return new Date(fecha).toLocaleString('es-AR');
  }

  obtenerArchivo(portfolio: PortfolioAdminModel): SafeUrl | null {
    if (!portfolio.archivoAdjunto || !portfolio.tipoArchivo) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustUrl(
      `data:${portfolio.tipoArchivo};base64,${portfolio.archivoAdjunto}`
    );
  }

  esImagen(portfolio: PortfolioAdminModel): boolean {
    return portfolio.tipoArchivo?.startsWith('image/') ?? false;
  }

  esPdf(portfolio: PortfolioAdminModel): boolean {
    return portfolio.tipoArchivo === 'application/pdf';
  }

  abrirImagen(): void {
    this.mostrarImagen = true;
  }

  cerrarImagen(): void {
    this.mostrarImagen = false;
  }

  aprobarPortfolio(): void {
    if (!this.portfolioSeleccionado) {
      return;
    }

    this.procesandoAccion = true;
    this.mensaje = '';
    this.errorMensaje = '';

    this.portfolioService.aprobarAdmin(
      this.portfolioSeleccionado.uuid,
      this.motivoAdmin
    ).subscribe({
      next: (actualizado) => {
        this.actualizarPortfolio(actualizado);
        this.mensaje = 'Portfolio aprobado correctamente.';
        this.procesandoAccion = false;
      },
      error: (error) => {
        console.error('Error al aprobar portfolio:', error);
        this.errorMensaje = 'No se pudo aprobar el portfolio.';
        this.procesandoAccion = false;
      }
    });
  }

  rechazarPortfolio(): void {
    if (!this.portfolioSeleccionado) {
      return;
    }

    if (!this.motivoAdmin.trim()) {
      this.errorMensaje = 'Tenés que ingresar un motivo de rechazo.';
      return;
    }

    this.procesandoAccion = true;
    this.mensaje = '';
    this.errorMensaje = '';

    this.portfolioService.rechazarAdmin(
      this.portfolioSeleccionado.uuid,
      this.motivoAdmin
    ).subscribe({
      next: (actualizado) => {
        this.actualizarPortfolio(actualizado);
        this.mensaje = 'Portfolio rechazado correctamente.';
        this.procesandoAccion = false;
      },
      error: (error) => {
        console.error('Error al rechazar portfolio:', error);
        this.errorMensaje = 'No se pudo rechazar el portfolio.';
        this.procesandoAccion = false;
      }
    });
  }

  private actualizarPortfolio(actualizado: PortfolioAdminModel): void {
    const indice = this.portfolios.findIndex(
      p => p.uuid === actualizado.uuid
    );

    if (indice !== -1) {
      this.portfolios[indice] = actualizado;
    }

    this.portfolioSeleccionado = actualizado;
    this.motivoAdmin = actualizado.notasAdmin ?? '';
  }

  obtenerUrlPdf(portfolio: PortfolioAdminModel): SafeResourceUrl | null {
  if (!portfolio.archivoAdjunto) return null;

  return this.sanitizer.bypassSecurityTrustResourceUrl(
    `data:application/pdf;base64,${portfolio.archivoAdjunto}`
  );
}

abrirPdf(portfolio: PortfolioAdminModel): void {
  if (!portfolio.archivoAdjunto) {
    console.error('El portfolio no contiene un archivo PDF.');
    return;
  }

  try {
    let base64 = portfolio.archivoAdjunto;

    // Si el Base64 ya contiene el prefijo data:, lo quitamos.
    if (base64.includes(',')) {
      base64 = base64.substring(base64.indexOf(',') + 1);
    }

    const contenido = atob(base64);

    const bytes = new Uint8Array(contenido.length);

    for (let i = 0; i < contenido.length; i++) {
      bytes[i] = contenido.charCodeAt(i);
    }

    const archivo = new Blob([bytes], {
      type: 'application/pdf'
    });

    const url = URL.createObjectURL(archivo);

    window.open(url, '_blank');

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);

  } catch (error) {
    console.error('Error al abrir el PDF:', error);
  }
}
}

