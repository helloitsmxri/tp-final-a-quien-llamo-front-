import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RatingResponse } from '../../models/rating-response';
import { RatingService } from '../../services/rating';
import { UsuarioService } from '../../../user/services/user';
import { DetalleRating } from '../detalle-rating/detalle-rating';

@Component({
  selector: 'app-list-rating',
  standalone: true,
  imports: [RouterModule, DetalleRating],
  templateUrl: './list-rating.html',
  styleUrl: './list-rating.css',
})
export class ListRating implements OnInit {
  private rService = inject(RatingService);
  private usuarioService = inject(UsuarioService);
  private route = inject(ActivatedRoute);

  ratingsRecibidas: RatingResponse[] = [];
  ratingsEnviadas: RatingResponse[] = [];

  pestanaActiva: 'recibidas' | 'enviadas' = 'recibidas';
  filtroEstrellas: number | 'todas' = 'todas';
  ratingSeleccionado: RatingResponse | null = null;
  cargando = true;
  estrellasArray = [1, 2, 3, 4, 5];

  ngOnInit(): void {
    const uuidRuta = this.route.snapshot.paramMap.get('uuid');

    if (uuidRuta) {
      this.cargarListas(uuidRuta);
    } else {
      // Toma el UUID del usuario logueado cuando entra desde "Mi cuenta -> Mis reseñas"
      this.usuarioService.getMyProfile().subscribe({
        next: (perfil) => this.cargarListas(perfil.uuid),
        error: (err) => {
          console.error('Error al obtener perfil:', err);
          this.cargando = false;
        },
      });
    }
  }

  private cargarListas(uuid: string): void {
    this.cargando = true;

    this.rService.getRecibidas(uuid).subscribe({
      next: (data) => {
        this.ratingsRecibidas = data;
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al cargar reseñas recibidas:', e);
        this.cargando = false;
      },
    });

    this.rService.getRemitidas(uuid).subscribe({
      next: (data) => (this.ratingsEnviadas = data),
      error: (e) => console.error('Error al cargar reseñas enviadas:', e),
    });
  }

  cambiarPestana(pestana: 'recibidas' | 'enviadas'): void {
    this.pestanaActiva = pestana;
    this.filtroEstrellas = 'todas';
    this.ratingSeleccionado = null;
  }

  cambiarFiltro(filtro: number | 'todas'): void {
    this.filtroEstrellas = filtro;
  }

  get ratingsFiltrados(): RatingResponse[] {
    const base =
      this.pestanaActiva === 'recibidas'
        ? this.ratingsRecibidas
        : this.ratingsEnviadas;

    if (this.filtroEstrellas === 'todas') {
      return base;
    }

    if (this.filtroEstrellas === 2) {
      return base.filter((r) => r.valoracion <= 2);
    }

    return base.filter((r) => r.valoracion === this.filtroEstrellas);
  }

  verDetalle(rating: RatingResponse): void {
    this.ratingSeleccionado = rating;
  }
}