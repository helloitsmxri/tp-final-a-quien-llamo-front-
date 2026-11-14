

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { EstadoVerificacion } from '../../../certificacion/enum/estado-verificacion';
import { CertificacionModel } from '../../../certificacion/models/certificacion-model';
import { CertificacionService } from '../../../certificacion/services/certificacion';

type FiltroCertificacion =
  | 'TODAS'
  | 'PENDIENTES'
  | 'APROBADAS'
  | 'RECHAZADAS';

@Component({
  selector: 'app-administrador-certificaciones',
  imports: [ReactiveFormsModule],
  templateUrl: './administrador-certificaciones.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './administrador-certificaciones.css',
})
export class AdministradorCertificaciones implements OnInit {

  estadoVerificacion = EstadoVerificacion;

  certificaciones: CertificacionModel[] = [];
  certificacionSeleccionada: CertificacionModel | null = null;

  filtroActual: FiltroCertificacion = 'TODAS';

  buscando = false;
  procesandoAccion = false;
  mostrarImagen = false;

  busquedaControl = new FormControl('', {
    nonNullable: true
  });

  motivoControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required]
  });

  constructor(
    private certificacionService: CertificacionService
  ) {}

  ngOnInit(): void {
    this.cargarCertificaciones();
  }

  cargarCertificaciones(): void {

    this.buscando = true;

    this.certificacionService.getAll().subscribe({

      next: (respuesta) => {
        this.certificaciones = respuesta;
        this.buscando = false;
        this.actualizarSeleccion();
      },

      error: () => {
        this.buscando = false;
        alert('No se pudieron cargar las certificaciones.');
      }

    });
  }

  cambiarFiltro(filtro: FiltroCertificacion): void {

    this.filtroActual = filtro;
    this.certificacionSeleccionada = null;
    this.motivoControl.reset('');
    this.mostrarImagen = false;
  }

  get certificacionesFiltradas(): CertificacionModel[] {

    let resultado: CertificacionModel[] = [];

    switch (this.filtroActual) {

      case 'TODAS':
        resultado = [...this.certificaciones];
        break;

      case 'PENDIENTES':
        resultado = this.certificaciones.filter(
          certificacion =>
            certificacion.estadoVerificacion === EstadoVerificacion.Pendiente
        );
        break;

      case 'APROBADAS':
        resultado = this.certificaciones.filter(
          certificacion =>
            certificacion.estadoVerificacion === EstadoVerificacion.Aprobado
        );
        break;

      case 'RECHAZADAS':
        resultado = this.certificaciones.filter(
          certificacion =>
            certificacion.estadoVerificacion === EstadoVerificacion.Rechazado
        );
        break;
    }

    const busqueda = this.busquedaControl.value.trim().toLowerCase();

    if (busqueda) {

      resultado = resultado.filter(certificacion => {

        const nombreTecnico =
          `${certificacion.nombreTecnico} ${certificacion.apellidoTecnico}`.toLowerCase();

        const titulo = certificacion.titulo.toLowerCase();

        const especialidad =
          (certificacion.nombreEspecialidad ?? '').toLowerCase();

        return nombreTecnico.includes(busqueda) ||
               titulo.includes(busqueda) ||
               especialidad.includes(busqueda) ||
               certificacion.uuid.toLowerCase().includes(busqueda);

      });
    }

    return resultado;
  }

  seleccionarCertificacion(certificacion: CertificacionModel): void {

    this.certificacionSeleccionada = certificacion;
    this.motivoControl.reset('');
    this.mostrarImagen = false;

  }

  private actualizarSeleccion(): void {

    if (!this.certificacionSeleccionada) {
      return;
    }

    const uuid = this.certificacionSeleccionada.uuid;

    const actualizada = this.certificaciones.find(
      certificacion => certificacion.uuid === uuid
    );

    if (actualizada) {
      this.certificacionSeleccionada = actualizada;
    }
  }

  obtenerImagen(certificacion: CertificacionModel): string {

    const imagen = certificacion.imagenBase64;

    if (!imagen) {
      return '';
    }

    // Si ya viene como data URL, se utiliza directamente.
    if (imagen.startsWith('data:')) {
      return imagen;
    }

    return `data:${certificacion.tipoImagen};base64,${imagen}`;
  }

  abrirImagen(): void {

    if (
      this.certificacionSeleccionada &&
      this.obtenerImagen(this.certificacionSeleccionada)
    ) {
      this.mostrarImagen = true;
    }

  }

  cerrarImagen(): void {
    this.mostrarImagen = false;
  }

  aprobarCertificacion(): void {

    if (
      !this.certificacionSeleccionada ||
      !this.esPendiente(this.certificacionSeleccionada)
    ) {
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de que querés aprobar esta certificación?'
    );

    if (!confirmar) {
      return;
    }

    const uuid = this.certificacionSeleccionada.uuid;

    this.procesandoAccion = true;

    this.certificacionService.aprobar(uuid).subscribe({

      next: (respuesta) => {

        this.procesandoAccion = false;
        this.actualizarCertificacion(respuesta);

        alert('La certificación fue aprobada correctamente.');

      },

      error: () => {

        this.procesandoAccion = false;

        alert('No se pudo aprobar la certificación.');

      }

    });
  }

  rechazarCertificacion(): void {

    if (
      !this.certificacionSeleccionada ||
      !this.esPendiente(this.certificacionSeleccionada)
    ) {
      return;
    }

    if (
      this.motivoControl.invalid ||
      !this.motivoControl.value.trim()
    ) {
      alert('Ingresá el motivo del rechazo.');
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de que querés rechazar esta certificación?'
    );

    if (!confirmar) {
      return;
    }

    const uuid = this.certificacionSeleccionada.uuid;
    const motivo = this.motivoControl.value.trim();

    this.procesandoAccion = true;

    this.certificacionService.rechazar(uuid, motivo).subscribe({

      next: (respuesta) => {

        this.procesandoAccion = false;
        this.actualizarCertificacion(respuesta);

        alert('La certificación fue rechazada.');

      },

      error: () => {

        this.procesandoAccion = false;

        alert('No se pudo rechazar la certificación.');

      }

    });
  }

  private actualizarCertificacion(
    certificacion: CertificacionModel
  ): void {

    const indice = this.certificaciones.findIndex(
      item => item.uuid === certificacion.uuid
    );

    if (indice !== -1) {
      this.certificaciones[indice] = certificacion;
    }

    this.certificacionSeleccionada = certificacion;
    this.motivoControl.reset('');
  }

  esPendiente(certificacion: CertificacionModel): boolean {

    return certificacion.estadoVerificacion === EstadoVerificacion.Pendiente;

  }

  formatearFecha(fecha: string): string {

    if (!fecha) {
      return 'Sin fecha';
    }

    // Evita que una fecha yyyy-MM-dd se muestre como el día anterior
    // por diferencias de zona horaria.
    const partes = fecha.split('-');

    if (partes.length === 3) {
      const [anio, mes, dia] = partes;
      return `${dia}/${mes}/${anio}`;
    }

    return new Date(fecha).toLocaleDateString('es-AR');
  }

  abrirCertificado(certificacion: CertificacionModel): void {

  const imagen = certificacion.imagenBase64;

  if (!imagen) {
    return;
  }

  try {
    let base64 = imagen;
    let tipo = certificacion.tipoImagen || 'image/jpeg';

    // Si ya viene como data URL, extraemos el MIME y el Base64.
    if (imagen.startsWith('data:')) {
      const partes = imagen.split(',');

      tipo = partes[0].match(/data:(.*?);base64/)?.[1] || tipo;
      base64 = partes[1];
    }

    const contenido = atob(base64);
    const bytes = new Uint8Array(contenido.length);

    for (let i = 0; i < contenido.length; i++) {
      bytes[i] = contenido.charCodeAt(i);
    }

    const archivo = new Blob([bytes], { type: tipo });
    const url = URL.createObjectURL(archivo);

    window.open(url, '_blank');

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);

  } catch (error) {
    console.error('Error al abrir el certificado:', error);
    alert('No se pudo abrir el certificado.');
  }
}

}
