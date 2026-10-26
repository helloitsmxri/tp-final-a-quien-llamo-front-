import { Component, inject, OnInit } from '@angular/core';
import { RatingService } from '../../services/rating';
import { RatingModel } from '../../models/rating-model';

@Component({
  imports: [],
  selector: 'app-detalle-rating',
  styleUrl: './detalle-rating.css',
  templateUrl: './detalle-rating.html',
})
export class DetalleRating implements OnInit{

  detalleService = inject(RatingService);
  ratings : RatingModel[] = [];
  
  ngOnInit(): void {
    this.obtenerRatingPersona;
  }

  //obtener RATING por la persona 
  obtenerRatingPersona(uuid : string){
        this.detalleService.getRatings(uuid).subscribe({
      next : (data) => { this.ratings = data},
      error : () => { alert('No se pudieron obtener los ratings')}
    })
  }

  // crear una reseña
  createRating(rating : RatingModel){
    this.detalleService.createRatings(rating).subscribe({
      next : () => {alert ('Se creó con éxito tu reseña')},
      error : () => {alert('No se pudo crear la reseña')}
    })
  }
}
