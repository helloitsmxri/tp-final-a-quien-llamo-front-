import { Component, inject, Input } from '@angular/core';
import { CertificacionModel } from '../../models/certificacion-model';
import { CertificacionService } from '../../services/certificacion';
import { EstadoVerificacion } from '../../enum/estado-verificacion';

@Component({
  imports: [],
  selector: 'app-detalle-certificacion',
  styleUrl: './detalle-certificacion.css',
  templateUrl: './detalle-certificacion.html',
})
export class DetalleCertificacion {
  private servicio = inject(CertificacionService);
 
  @Input() uuidTecnico = '';
 
  readonly Estado = EstadoVerificacion;
  certificaciones: CertificacionModel[] = [];
  cargando = false;
  error: string | null = null;
 
  ngOnChanges(): void {
    this.cargar();
  }
 
  // público para poder recargar después de crear una (ver (creada) del formulario)
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
        this.error = e?.error?.message ?? 'No se pudieron cargar tus títulos.';
        this.cargando = false;
      },
    });
  }
 
  // Los navegadores bloquean abrir data: URLs de PDF; con un Blob funciona para PDF e imágenes
  abrir(c: CertificacionModel): void {
    const bytes = Uint8Array.from(atob(c.imagenBase64), (ch) => ch.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: c.tipoImagen }));
    window.open(url, '_blank');
  }
}
