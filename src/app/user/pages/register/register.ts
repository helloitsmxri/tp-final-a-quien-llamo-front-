import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { UsuarioService } from '../../services/user';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  nombre: FormControl;
  apellido: FormControl;
  dni: FormControl;
  email: FormControl;
  clave: FormControl;
  telefono: FormControl;
  fechaNacimiento: FormControl;
  sobreMi: FormControl;

  formulario: FormGroup;

  foto: File | null = null;

  constructor(public uService: UsuarioService) {

    this.nombre = new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]);

    this.apellido = new FormControl('', [
      Validators.required,
      Validators.minLength(2)
    ]);

    this.dni = new FormControl('', [
      Validators.required
    ]);

    this.email = new FormControl('', [
      Validators.required,
      Validators.email
    ]);

    this.clave = new FormControl('', [
      Validators.required,
      Validators.minLength(8)
    ]);

    this.telefono = new FormControl('', [
      Validators.required,
      Validators.maxLength(10)
    ]);

    this.fechaNacimiento = new FormControl('', [
      Validators.required
    ]);

    this.sobreMi = new FormControl('', [
      Validators.maxLength(500)
    ]);

    this.formulario = new FormGroup({
      nombre: this.nombre,
      apellido: this.apellido,
      dni: this.dni,
      email: this.email,
      clave: this.clave,
      telefono: this.telefono,
      fechaNacimiento: this.fechaNacimiento,
      sobreMi: this.sobreMi
    });
  }

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.foto = input.files[0];
    }
  }

  registrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    formData.append('nombre', this.nombre.value);
    formData.append('apellido', this.apellido.value);
    formData.append('dni', this.dni.value);
    formData.append('email', this.email.value);
    formData.append('clave', this.clave.value);
    formData.append('telefono', this.telefono.value);
    formData.append('fechaNacimiento', this.fechaNacimiento.value);
    formData.append('sobreMi', this.sobreMi.value ?? '');

    // Agregar la foto solamente si se seleccionó una
    if (this.foto) {
      formData.append('foto', this.foto);
    }

    this.uService.store(formData).subscribe({
      next: (respuesta) => {
        console.log('Usuario registrado correctamente', respuesta);
        this.formulario.reset();
        this.foto = null;
      },
      error: (e) => {
        console.error('Error al registrar usuario', e);
      }
    });
  }

  verSubmit(): void {
    console.log(this.formulario.value);
  }

}
