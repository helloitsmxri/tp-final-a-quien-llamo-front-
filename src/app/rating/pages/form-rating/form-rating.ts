import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RatingService } from '../../services/rating';
import { RatingModel } from '../../models/rating-model';
import { FormRatingModel } from '../../models/form-rating-model';

@Component({
  selector: 'app-form-rating',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './form-rating.html',
  styleUrl: './form-rating.css',
})
export class FormRating {

  uuidRemitente: FormControl;
  uuidDestinatario: FormControl;
  usuarioDestinatario: FormControl;
  valoracion: FormControl;
  descripcion: FormControl;
  tipoFoto: FormControl;
  foto: FormControl;
  caracteristicas: FormControl;

  formulario: FormGroup;

  constructor(public rService: RatingService) {

    this.uuidRemitente = new FormControl('', [Validators.required]);

    this.uuidDestinatario = new FormControl('', [Validators.required]);

    this.usuarioDestinatario = new FormControl('', [Validators.required]);

    this.valoracion = new FormControl(5, [
      Validators.required,
      Validators.min(1),
      Validators.max(5)
    ]);

    this.descripcion = new FormControl('', [Validators.maxLength(500)]);

    this.tipoFoto = new FormControl(null);

    this.foto = new FormControl(null);

    this.caracteristicas = new FormControl([], [Validators.required]);

    this.formulario = new FormGroup({
      uuidRemitente: this.uuidRemitente,
      uuidDestinatario: this.uuidDestinatario,
      usuarioDestinatario: this.usuarioDestinatario,
      valoracion: this.valoracion,
      descripcion: this.descripcion,
      tipoFoto: this.tipoFoto,
      foto: this.foto,
      caracteristicas: this.caracteristicas
    });
  }

  // Suma las características escritas (separadas por coma) a las que ya hay
  agregarCaracteristicas(texto: string): void {
    const nuevas = texto
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    this.caracteristicas.setValue([...this.caracteristicas.value, ...nuevas]);
    this.caracteristicas.markAsTouched();
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const form: FormRatingModel = this.formulario.value;

    // El formulario y el back no usan los mismos nombres: se convierte antes de enviar
    const rating: RatingModel = {
      uuidRemitente: form.uuidRemitente,
      uuidDestinatario: form.uuidDestinatario,
      valoracion: form.valoracion,
      descripcion: form.descripcion ?? undefined,
      tipoFoto: form.tipoFoto ?? '',
      foto: form.foto,
      uuidCaracteristicas: form.caracteristicas
    };

    this.rService.createRatings(rating).subscribe({
      next: (respuesta) => {
        console.log('Calificación registrada correctamente', respuesta);
        this.formulario.reset({
          valoracion: 5,
          descripcion: '',
          tipoFoto: null,
          foto: null,
          caracteristicas: []
        });
      },
      error: (e) => {
        console.error('Error al registrar la calificación', e);
      }
    });
  }

  verSubmit(): void {
    console.log(this.formulario.value);
  }
}