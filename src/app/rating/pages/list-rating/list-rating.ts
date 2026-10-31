import { Component, OnInit } from '@angular/core';
import { RatingModel } from '../../models/rating-model';
import { RatingService } from '../../services/rating';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-list-rating',
  imports: [],
  templateUrl: './list-rating.html',
  styleUrl: './list-rating.css',
})
export class ListRating implements OnInit{

    ratings:RatingModel[]
  constructor(public rService: RatingService, public root:ActivatedRoute){
    this.ratings=[];
  }

  ngOnInit(): void {
    this.listarRatings()
  }

  listarRatings(){
    this.rService.getAll().subscribe({
      next:(data)=>(this.ratings=data),
      error:(e)=>(console.log(e))
    })
  }
}
