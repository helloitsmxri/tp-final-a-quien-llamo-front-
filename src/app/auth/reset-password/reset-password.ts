
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { AlertaService } from '../../shared/alertas/service/alerta-service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './reset-password.css'
})
export class ResetPassword {

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private alertaService = inject(AlertaService);

  token = '';
  cargando = false;
  mensaje = '';
  error = '';
  completado = false;

  formulario = new FormGroup({
    newPassword: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/)
    ]),
    confirmarPassword: new FormControl('', [
      Validators.required
    ])
  });

  constructor() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.token) {
      this.error = 'El enlace de recuperación no es válido o no contiene un token.';
    }
  }

  get newPassword() {
    return this.formulario.get('newPassword')!;
  }

  get confirmarPassword() {
    return this.formulario.get('confirmarPassword')!;
  }

  manejarEnvio(): void {
    this.error = '';
    this.mensaje = '';

    if (!this.token) {
      this.alertaService.error('No se encontró un token de recuperación válido.');
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    if (this.newPassword.value !== this.confirmarPassword.value) {
      this.alertaService.error('Las contraseñas no coinciden.');
      return;
    }

    this.cargando = true;

    this.authService.resetPassword(
      this.token,
      this.newPassword.value!
    ).subscribe({
      next: () => {
        this.cargando = false;
        this.completado = true;

        this.alertaService.exito('¡Tu contraseña se actualizó correctamete')

        this.formulario.reset();
      },
      error: (err) => {
        console.error('Error al restablecer la contraseña:', err);
        this.cargando = false;

        this.alertaService.error('No se pudo restablecer la contraseña. El enlace puede haber expirado');
      }
    });
  }
}
