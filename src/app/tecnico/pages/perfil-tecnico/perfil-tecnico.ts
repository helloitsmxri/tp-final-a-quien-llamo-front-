
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TecnicoService } from '../../services/tecnico';
import { UsuarioService } from '../../../user/services/user';
import { RatingService } from '../../../rating/services/rating';
import { PerfilTecnicoModel } from '../../models/PerfilTecnicoModel';
import { RatingResponse } from '../../../rating/models/rating-response';
import { DetalleCertificacion } from '../../../certificacion/pages/detalle-certificacion/detalle-certificacion';
import { DetallePortfolio } from '../../../portfolio/pages/detalle-portfolio/detalle-portfolio';

interface ItemDetalle {
  titulo: string;
  detalle: string;
}

@Component({
  selector: 'app-perfil-tecnico',
  imports: [DetalleCertificacion, DetallePortfolio, RouterLink],
  templateUrl: './perfil-tecnico.html',
  styleUrl: './perfil-tecnico.css',
})
export class PerfilTecnico implements OnInit {

  private servicio = inject(TecnicoService);
  private usuarioService = inject(UsuarioService);
  private ratingService = inject(RatingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Datos del técnico
  tecnico: PerfilTecnicoModel | null = null;
  errorCarga = false;

  // Proyectos
  proyectosLista: ItemDetalle[] = [];

  // Reseñas
  resenas: RatingResponse[] = [];
  promedio = 0;

  // Imágenes de las estrellas según la valoración
  private imagenesEstrellas: { [key: number]: string } = {
    0.5: 'media-estrella',
    1: 'una-estrella',
    1.5: 'una-estrella-y-media',
    2: 'dos-estrellas',
    2.5: 'dos-estrellas-y-media',
    3: 'tres-estrellas',
    3.5: 'tres-estrellas-y-media',
    4: 'cuatro-estrellas',
    4.5: 'cuatro-estrellas-y-media',
    5: 'cinco-estrellas'
  };

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');

    // Sin uuid en la URL = cargo MI perfil
    if (!uuid) {
      this.servicio.getMiPerfil().subscribe({
        next: (data: PerfilTecnicoModel) => {
          this.tecnico = data;
          this.procesarProyectos();

          // Obtengo el uuid del usuario para cargar sus reseñas
          this.usuarioService.getMyProfile().subscribe({
            next: (u) => this.cargarResenas(u.uuid),
            error: () => (this.resenas = []),
          });
        },
        error: (error: any) => {
          console.error('Error al cargar mi perfil de técnico:', error.status, error.error);
          this.errorCarga = true;
        },
      });
      return;
    }

    this.servicio.getPerfil(uuid).subscribe({
      next: (data: PerfilTecnicoModel) => {
        this.tecnico = data;
        this.procesarProyectos();
        this.cargarResenas(data.uuidUsuario);
      },
      error: (error: any) => {
        console.error('Error al cargar el perfil:', error);
        console.error('Estado HTTP:', error.status);
        console.error('Respuesta del servidor:', error.error);

        this.errorCarga = true;
      },
    });
  }

  // Foto del técnico
  get fotoSrc(): string | null {
    if (!this.tecnico?.fotoBase64) {
      return null;
    }

    if (!this.tecnico.tipoImagen) {
      return null;
    }

    return `data:${this.tecnico.tipoImagen};base64,${this.tecnico.fotoBase64}`;
  }

  // Iniciales del técnico
  get iniciales(): string {
    const nombre = this.tecnico?.nombre ?? '';
    const apellido = this.tecnico?.apellido ?? '';

    return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
  }

  // Obtener imagen de estrellas según la valoración
  imagenEstrellas(valor: number): string | null {
    if (valor <= 0) {
      return null;
    }

    const redondeado = Math.min(
      5,
      Math.max(0.5, Math.round(valor * 2) / 2)
    );

    return `/ilustraciones/rating/${this.imagenesEstrellas[redondeado]}.png`;
  }

  // Cargar las reseñas que recibió el usuario
  private cargarResenas(uuidUsuario: string): void {
    this.ratingService.getRecibidas(uuidUsuario).subscribe({
      next: (data: RatingResponse[]) => {
        this.resenas = data;
        this.promedio = this.calcularPromedio(data);
      },
      error: (e) => {
        console.error('Error al cargar las reseñas:', e.status, e.url);
        this.resenas = [];
        this.promedio = 0;
      },
    });
  }

  private calcularPromedio(lista: RatingResponse[]): number {
    return lista.length
      ? lista.reduce((suma, r) => suma + r.valoracion, 0) / lista.length
      : 0;
  }

  // Iniciales de quien escribió la reseña
  inicialesDe(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  // Procesar proyectos separados por saltos de línea
  // Formato esperado: "Nombre — detalle"
  private procesarProyectos(): void {
    this.proyectosLista = (this.tecnico?.proyectos ?? '')
      .split('\n')
      .map((linea) => linea.trim())
      .filter(Boolean)
      .map((linea) => {
        const separador = linea.indexOf(' — ');

        if (separador === -1) {
          return { titulo: linea, detalle: '' };
        }

        return {
          titulo: linea.slice(0, separador),
          detalle: linea.slice(separador + 3),
        };
      });
  }

  verPerfilUsuario(uuid: string): void {
    if (!uuid) {
      return;
    }

    this.router.navigate(['/perfil', uuid]);
  }
}
