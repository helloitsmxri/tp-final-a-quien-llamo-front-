import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { TecnicoService } from '../../services/tecnico';
import { RatingService } from '../../../rating/services/rating';
import { PerfilTecnicoModel } from './models/PerfilTecnicoModel';
import { Calendario } from '../../../components/calendario/calendario';
import { RatingResponse } from '../../../rating/models/rating-response';

interface ItemDetalle {
  titulo: string;
  detalle: string;
}

@Component({
  selector: 'app-perfil-tecnico',
  imports: [Calendario],
  templateUrl: './perfil-tecnico.html',
  styleUrl: './perfil-tecnico.css',
})
export class PerfilTecnico implements OnInit {

  private servicio = inject(TecnicoService);
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

  // Datos de ejemplo para estudios
  estudios: ItemDetalle[] = [
    {
      titulo: 'Master in Landscape Architecture',
      detalle: 'Harvard Graduate School of Design',
    },
    {
      titulo: 'MSc in Interior and Spatial Design',
      detalle: 'Politecnico di Milano',
    },
  ];

  // Datos de ejemplo para certificaciones
  certificaciones: ItemDetalle[] = [
    {
      titulo: 'LEED Accredited Professional',
      detalle: 'Interior Design & Construction',
    },
    {
      titulo: 'Certified Sustainable Landscape Designer',
      detalle: '',
    },
    {
      titulo: 'International Landscape Design Award',
      detalle: '2022',
    },
  ];

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (!uuid || uuid === 't1') {
      this.cargarMock();
      return;
    }

    this.servicio.getPerfil(uuid).subscribe({
      next: (data: PerfilTecnicoModel) => {
        this.tecnico = data;
        this.procesarProyectos();
        this.cargarResenas(uuid); // TODO: cambiar por data.uuidUsuario cuando el back lo agregue
      },
      error: (error: any) => {
        console.error('Error al cargar el perfil:', error);
        console.error('URL solicitada:', error.url);
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

  // Representación de las estrellas
  estrellas(valor: number): string {
    const cantidad = Math.max(0, Math.min(5, Math.round(valor)));

    return '★'.repeat(cantidad) + '☆'.repeat(5 - cantidad);
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

  // Iniciales de quien escribió la reseña (el back todavía no manda su foto)
  inicialesDe(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  // Procesar proyectos separados por saltos de línea.
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

  // Datos ficticios para probar el diseño sin UUID
  private cargarMock(): void {
    this.tecnico = {
      uuid: 't1',
      nombre: 'Jane',
      apellido: 'Doe',
      email: 'jane@mail.com',
      telefono: '2235550000',
      sobreMi:
        'Si querés que tus hogares hagan que tu casa, comercio u oficina, ya sabés con quién trabajar.',
      fotoBase64: null,
      tipoImagen: null,
      cuit: '20384920499',
      descripcionTrabajo:
        '¡Hola! Me llamo Jane y me dedico al paisajismo y al diseño de interiores. He trabajado en proyectos alrededor del mundo y recibí el premio Gran Diseño en 2020.',
      proyectos:
        'Casa Aurelia — Buenos Aires, Argentina (Interior + landscaping)\n' +
        'Luna Mare Restaurant — Barcelona, España (Interior design)\n' +
        'The Olive House — Tulum, México',
      habilidades: [
        'Diseño residencial',
        'Diseño hotelero',
        'Jardines sostenibles',
      ],
      especialidades: [
        'Paisajista',
        'Diseñadora de Interiores',
      ],
    };

    this.procesarProyectos();

    this.resenas = [
      {
        uuidRemitente: 'u1',
        nombreRemitente: 'Abril González',
        nombreDestinatario: 'Jane Doe',
        valoracion: 5,
        descripcion: 'Excelente trabajo y muy buena atención.',
        tipoFoto: null,
        foto: null,
        caracteristicas: ['Responsable', 'Amigable', 'Ordenada'],
      },
      {
        uuidRemitente: 'u2',
        nombreRemitente: 'Ludmila Domínguez',
        nombreDestinatario: 'Jane Doe',
        valoracion: 5,
        descripcion: 'Muy conforme con el resultado.',
        tipoFoto: null,
        foto: null,
        caracteristicas: ['Pulcra', 'Clara', 'Ordenada'],
      },
    ];

    this.promedio = this.calcularPromedio(this.resenas);
  }
  
  verPerfilUsuario(uuid: string): void {
  if (!uuid) {
    return;
    }
    this.router.navigate(['/usuario', uuid]); // ajustar a la ruta real del perfil de usuario
  }
}