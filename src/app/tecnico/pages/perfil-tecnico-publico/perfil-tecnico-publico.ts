
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ItemPublico, TecnicoService } from '../../services/tecnico';
import { RatingService } from '../../../rating/services/rating';
import { PerfilTecnicoModel } from '../../models/PerfilTecnicoModel';
import { RatingResponse } from '../../../rating/models/rating-response';
import { AuthService } from '../../../auth/services/auth-service';

interface ItemDetalle {
  titulo: string;
  detalle: string;
}

@Component({
  selector: 'app-perfil-tecnico-publico',
  imports: [],
  templateUrl: './perfil-tecnico-publico.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: [
    '../perfil-tecnico/perfil-tecnico.css',
    './perfil-tecnico-publico.css',
  ],
})
export class PerfilTecnicoPublico implements OnInit {

  private servicio = inject(TecnicoService);
  private ratingService = inject(RatingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  tecnico: PerfilTecnicoModel | null = null;
  errorCarga = false;

  proyectosLista: ItemDetalle[] = [];

  resenas: RatingResponse[] = [];
  promedio = 0;
  imagenEstrellas: string | null = null;

  certificaciones: ItemPublico[] = [];
  portfolios: ItemPublico[] = [];

  // Ilustraciones de estrellas
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
    5: 'cinco-estrellas',
  };

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (!uuid) {
      this.errorCarga = true;
      return;
    }

    this.servicio.getPerfil(uuid).subscribe({
      next: (data: PerfilTecnicoModel) => {
        this.tecnico = data;
        this.procesarProyectos();
        this.cargarDocumentos(data.uuid);
        this.cargarResenas(data.uuidUsuario);
      },
      error: (error: any) => {
        console.error('Error al cargar el perfil:', error.status, error.error);
        this.errorCarga = true;
      },
    });
  }

  // Cargar certificaciones y portfolios
  private cargarDocumentos(uuidTecnico: string): void {
    this.servicio.getCertificaciones(uuidTecnico).subscribe({
      next: (lista) => (this.certificaciones = lista),
      error: (e) => console.error('Error al cargar las certificaciones:', e.status),
    });

    this.servicio.getPortfolios(uuidTecnico).subscribe({
      next: (lista) => (this.portfolios = lista),
      error: (e) => console.error('Error al cargar los portfolios:', e.status),
    });
  }

  // Contactar al técnico
contactar(): void {
  if (!this.tecnico) return;

  if (!this.authService.hasToken()) {
    this.router.navigate(['/iniciar-sesion'], {
      queryParams: {
        returnUrl: this.router.url
      }
    });
    return;
  }

  this.router.navigate(['/chats'], {
    queryParams: { tecnico: this.tecnico.uuid },
  });
}

  // Foto del técnico
  get fotoSrc(): string | null {
    if (!this.tecnico?.fotoBase64 || !this.tecnico.tipoImagen) {
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

  // Cargar las reseñas recibidas
  private cargarResenas(uuidUsuario: string): void {
    this.ratingService.getRecibidas(uuidUsuario).subscribe({
      next: (data: RatingResponse[]) => {
        this.resenas = data;
        this.promedio = this.calcularPromedio(data);

        this.imagenEstrellas = data.length > 0
          ? this.obtenerImagenEstrellas(this.promedio)
          : null;
      },
      error: (e) => {
        console.error('Error al cargar las reseñas:', e.status, e.url);
        this.resenas = [];
        this.promedio = 0;
        this.imagenEstrellas = null;
      },
    });
  }

  // Calcular promedio de calificaciones
  private calcularPromedio(lista: RatingResponse[]): number {
    return lista.length
      ? lista.reduce((suma, r) => suma + r.valoracion, 0) / lista.length
      : 0;
  }

  // Obtener ilustración de estrellas redondeada a 0,5
  obtenerImagenEstrellas(valor: number): string {
    const aMedios = Math.round(valor * 2) / 2;
    const redondeado = Math.min(5, Math.max(0.5, aMedios));

    return `/ilustraciones/rating/${this.imagenesEstrellas[redondeado]}.png`;
  }

  // Obtener iniciales de quien escribió la reseña
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

  // Navegar al perfil del usuario que dejó la reseña
  verPerfilUsuario(uuid: string): void {
    if (!uuid) {
      return;
    }

    this.router.navigate(['/usuario', uuid]);
  }
}
