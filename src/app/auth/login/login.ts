import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthLoginModel } from '../models/auth-login-model';

@Component({
  imports: [RouterLink, ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);

  cargando: boolean = false;
  error: string = '';

  formulario = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    password: new FormControl('', [
      Validators.required
    ])
  });

  get username() {
    return this.formulario.get('username')!;
  }

  get password() {
    return this.formulario.get('password')!;
  }

  manejarEnvio(): void {

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.error = '';

    const login: AuthLoginModel = {username: this.username.value!,password: this.password.value!};

    this.authService.login(login).subscribe({

      next: (response) => {

        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);

        this.cargando = false;

        this.router.navigate(['/home']);
      },

      error: (err) => {
        console.error(err);
        this.error = err.error?.message || 'Email o clave incorrectos.';
        this.cargando = false;
      }

    });
  }
}
