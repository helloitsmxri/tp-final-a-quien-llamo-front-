import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RatingResponse } from '../../models/rating-response';
import { RatingService } from '../../services/rating';

@Component({
  selector: 'app-list-rating',
  imports: [],
  templateUrl: './list-rating.html',
  styleUrl: './list-rating.css',
})

export class ListRating implements OnInit {

  ratings: RatingResponse[] = [];

  constructor(public rService: RatingService, public root: ActivatedRoute) {}

  ngOnInit(): void {
    this.listarRatings();
  }

  listarRatings() {
    const uuid = this.root.snapshot.paramMap.get('uuid');

    if (!uuid) {
      return;
    }

    this.rService.getRecibidas(uuid).subscribe({
      next: (data) => (this.ratings = data),
      error: (e) => console.log(e)
    });
  }
}