import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { RatingResponse } from '../../models/rating-response';

@Component({
  selector: 'app-detalle-rating',
  standalone: true,
  imports: [],
  templateUrl: './detalle-rating.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detalle-rating.css',
})
export class DetalleRating {
  @Input() ratingSeleccionado!: RatingResponse;
  @Input() esRecibida = true;
  @Output() volver = new EventEmitter<void>();

  estrellasArray = [1, 2, 3, 4, 5];

  volverALista(): void {
    this.volver.emit();
  }
}