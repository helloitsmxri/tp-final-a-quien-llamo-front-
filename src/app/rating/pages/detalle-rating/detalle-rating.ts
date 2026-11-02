import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RatingService } from '../../services/rating';
import { RatingModel } from '../../models/rating-model';
import { RatingResponse } from '../../models/rating-response';

@Component({
  imports: [],
  selector: 'app-detalle-rating',
  styleUrl: './detalle-rating.css',
  templateUrl: './detalle-rating.html',
})

export class DetalleRating implements OnInit {

  private detalleService = inject(RatingService);
  private route = inject(ActivatedRoute);

  ratings: RatingResponse[] = [];

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (uuid) {
      this.obtenerRatingPersona(uuid);
    }
  }

  // obtener las reseñas que recibió una persona (uuid del USUARIO)
  obtenerRatingPersona(uuid: string) {
    this.detalleService.getRecibidas(uuid).subscribe({
      next: (data) => { this.ratings = data; },
      error: () => { alert('No se pudieron obtener los ratings'); }
    });
  }

  // crear una reseña
  createRating(rating: RatingModel) {
    this.detalleService.createRatings(rating).subscribe({
      next: () => { alert('Se creó con éxito tu reseña'); },
      error: () => { alert('No se pudo crear la reseña'); }
    });
  }
}