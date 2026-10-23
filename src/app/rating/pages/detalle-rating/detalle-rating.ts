import { Component, OnInit } from '@angular/core';
import { RatingModel } from '../../models/rating-model';
import { RatingService } from '../../services/rating';
import { ActivatedRoute } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-detalle-rating',
  styleUrl: './detalle-rating.css',
  templateUrl: './detalle-rating.html',
})
export class DetalleRating implements OnInit {
    rating:RatingModel | undefined
  constructor(public rService:RatingService, public route:ActivatedRoute){}

  ngOnInit(): void {  
    const uuid = this.route.snapshot.paramMap.get('uuid');
    this.detalleRating(uuid)
  }

  detalleRating(uuid : string|null){
    this.rService.getByUuid(uuid).subscribe({
      next:(data)=>(this.rating=data),
      error:(e)=>(console.log(e))
    })
  }
}
