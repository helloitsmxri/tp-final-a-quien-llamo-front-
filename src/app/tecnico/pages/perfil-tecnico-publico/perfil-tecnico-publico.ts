import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ItemPublico, TecnicoService } from '../../services/tecnico';
import { RatingService } from '../../../rating/services/rating';
import { PerfilTecnicoModel } from '../../models/PerfilTecnicoModel';
import { RatingResponse } from '../../../rating/models/rating-response';

interface ItemDetalle {
  titulo: string;
  detalle: string;
}

@Component({
  selector: 'app-perfil-tecnico-publico',
  imports: [],
  templateUrl: './perfil-tecnico-publico.html',
  styleUrls: ['../perfil-tecnico/perfil-tecnico.css', './perfil-tecnico-publico.css'],
})
export class PerfilTecnicoPublico implements OnInit {

  private servicio = inject(TecnicoService);
  private ratingService = inject(RatingService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tecnico: PerfilTecnicoModel | null = null;
  errorCarga = false;

  proyectosLista: ItemDetalle[] = [];

  resenas: RatingResponse[] = [];
  promedio = 0;
  certificaciones: ItemPublico[] = [];
  portfolios: ItemPublico[] = [];

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

  // lleva al chat
  contactar(): void {
    if (!this.tecnico) return;
    this.router.navigate(['/chats'], { queryParams: { tecnico: this.tecnico.uuid } });
  }

  get fotoSrc(): string | null {
    if (!this.tecnico?.fotoBase64 || !this.tecnico.tipoImagen) {
      return null;
    }
    return `data:${this.tecnico.tipoImagen};base64,${this.tecnico.fotoBase64}`;
  }

  get iniciales(): string {
    const nombre = this.tecnico?.nombre ?? '';
    const apellido = this.tecnico?.apellido ?? '';
    return (nombre.charAt(0) + apellido.charAt(0)).toUpperCase();
  }

  estrellas(valor: number): string {
    const cantidad = Math.max(0, Math.min(5, Math.round(valor)));
    return '★'.repeat(cantidad) + '☆'.repeat(5 - cantidad);
  }

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

  inicialesDe(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

 
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
    this.router.navigate(['/usuario', uuid]); //capaz ajustar ruta
  }
}