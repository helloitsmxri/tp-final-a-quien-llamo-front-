
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RatingService } from '../../services/rating';
import { RatingModel } from '../../models/rating-model';

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

  uuid: string | null = null;
  editando = false;

  constructor(public rService: RatingService) {

    this.uuidRemitente = new FormControl('', [
      Validators.required
    ]);

    this.uuidDestinatario = new FormControl('', [
      Validators.required
    ]);

    this.usuarioDestinatario = new FormControl('', [
      Validators.required
    ]);

    this.valoracion = new FormControl(5, [
      Validators.required,
      Validators.min(1),
      Validators.max(5)
    ]);

    this.descripcion = new FormControl('', [
      Validators.maxLength(500)
    ]);

    this.tipoFoto = new FormControl(null);

    this.foto = new FormControl(null);

    this.caracteristicas = new FormControl([], [
      Validators.required
    ]);

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

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const rating: Partial<RatingModel> = this.formulario.value;

    this.rService.store(rating).subscribe({
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

  cargarRating(uuid: string): void {
    this.rService.getByUuid(uuid).subscribe({
      next: (respuesta: RatingModel) => {
        this.uuid = uuid;
        this.editando = true;
        this.formulario.patchValue(respuesta);
      },
      error: (e) => {
        console.error('Error al cargar la calificación', e);
      }
    });
  }

  actualizar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (!this.uuid) {
      console.error('No se encontró el UUID de la calificación');
      return;
    }

    const rating: Partial<RatingModel> = this.formulario.value;

    this.rService.update(this.uuid, rating).subscribe({
      next: (respuesta) => {
        console.log('Calificación actualizada correctamente', respuesta);
        this.formulario.reset();
        this.uuid = null;
        this.editando = false;
      },
      error: (e) => {
        console.error('Error al actualizar la calificación', e);
      }
    });
  }

  verSubmit(): void {
    console.log(this.formulario.value);
  }
}

