import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TecnicoService } from '../../../tecnico/services/tecnico';
import { CertificacionService } from '../../services/certificacion';
import { CertificacionModel } from '../../models/certificacion-model';
import { EstadoVerificacion } from '../../enum/estado-verificacion';

@Component({
  selector: 'app-certificacion-list',
  imports: [DatePipe],
  templateUrl: './certificacion-list.html',
  styleUrl: './certificacion-list.css',
})
export class CertificacionList implements OnInit {
  private tecnicoService = inject(TecnicoService);
  private servicio = inject(CertificacionService);

  readonly Estado = EstadoVerificacion;

  certificaciones: CertificacionModel[] = [];
  cargando = false;
  error: string | null = null;

  ngOnInit(): void {
    this.cargarCertificaciones();
  }

  cargarCertificaciones(): void {
    this.cargando = true;
    this.error = null;

    this.tecnicoService.getMiPerfil().subscribe({
      next: (tecnico) => {
        this.servicio.getByTecnico(tecnico.uuid).subscribe({
          next: (datos) => {
            this.certificaciones = datos ?? [];
            this.cargando = false;
          },
          error: (e) => {
            console.error('Error al cargar las certificaciones:', e);
            this.error = 'No se pudieron cargar tus certificaciones.';
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

  abrir(c: CertificacionModel): void {
    const bytes = Uint8Array.from(atob(c.imagenBase64), (ch) => ch.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: c.tipoImagen }));
    window.open(url, '_blank');
  }
}