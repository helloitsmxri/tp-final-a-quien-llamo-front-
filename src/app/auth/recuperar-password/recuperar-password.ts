
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service';


@Component({
  selector: 'app-recuperar-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './recuperar-password.css'
})
export class RecuperarPassword {

  private authService = inject(AuthService);

  cargando = false;
  mensaje = '';
  error = '';

  formulario = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  get email() {
    return this.formulario.get('email')!;
  }

  manejarEnvio(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.error = '';

    this.authService.forgotPassword(this.email.value!).subscribe({
      next: () => {
        this.mensaje = 'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.';
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'No se pudo procesar la solicitud. Intentá nuevamente.';
        this.cargando = false;
      }
    });
  }
}
