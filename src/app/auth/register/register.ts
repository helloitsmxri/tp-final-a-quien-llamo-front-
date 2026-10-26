import { Component, inject } from '@angular/core';
import {AbstractControl,FormBuilder,ReactiveFormsModule,ValidationErrors,Validators,} from '@angular/forms';
import { Calendario } from '../../components/calendario/calendario';
import { AuthService } from '../services/auth-service';

// Validador del grupo: compara "clave" con "repetirClave"
function clavesIguales(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('clave')?.value === grupo.get('repetirClave')?.value
    ? null
    : { clavesDistintas: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, Calendario],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  private fb = inject(FormBuilder);
  private uService = inject(AuthService);

  // Paso actual del formulario (1 o 2)
  paso = 1;

  // Campos que se completan en el paso 1
  camposPaso1 = ['email', 'clave', 'repetirClave', 'nombre', 'apellido'];

  foto: File | null = null;

  formulario = this.fb.group({
    // Paso 1
    email: ['', [Validators.required, Validators.email]],
    clave: ['', [Validators.required, Validators.minLength(8)]],
    repetirClave: ['', [Validators.required]],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    apellido: ['', [Validators.required, Validators.minLength(2)]],

    // Paso 2
    dni: ['', [Validators.required]],
    fechaNacimiento: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.maxLength(10)]],
    sobreMi: ['', [Validators.maxLength(500)]],
  }, { validators: clavesIguales });

  // Devuelve el mensaje de error de un campo (o null si no hay nada que mostrar)
  errorMensaje(campo: string): string | null {
    const c = this.formulario.get(campo);

    if (!c || !c.touched) return null;

    if (c.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (campo === 'repetirClave' && this.formulario.hasError('clavesDistintas')) {
      return 'Las contraseñas no coinciden.';
    }

    if (c.hasError('email')) {
      return 'Ingresá un email válido.';
    }

    if (c.hasError('minlength')) {
      return `Debe tener al menos ${c.errors?.['minlength'].requiredLength} caracteres.`;
    }

    if (c.hasError('maxlength')) {
      return `No puede superar los ${c.errors?.['maxlength'].requiredLength} caracteres.`;
    }

    return null;
  }

  siguiente(): void {
    const controles = this.camposPaso1.map(c => this.formulario.get(c)!);

    // Los marco como "tocados" para que aparezcan los errores
    controles.forEach(c => c.markAsTouched());

    const todoOk = controles.every(c => c.valid) && !this.formulario.hasError('clavesDistintas');

    if (todoOk) {
      this.paso = 2;
    }
  }

  volver(): void {
    this.paso = 1;
  }

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.foto = input.files[0];
    }
  }

  registrar(): void {
    // Si apretan Enter en el paso 1, avanza en vez de enviar
    if (this.paso === 1) {
      this.siguiente();
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    // repetirClave solo sirve para validar, no se envía
    const { repetirClave, ...datos } = this.formulario.getRawValue();

    const formData = new FormData();

    Object.entries(datos).forEach(([clave, valor]) => {
      formData.append(clave, valor ?? '');
    });

    // Agregar la foto solamente si se seleccionó una
    if (this.foto) {
      formData.append('foto', this.foto);
    }

    this.uService.store(formData).subscribe({
      next: (respuesta) => {
        console.log('Usuario registrado correctamente', respuesta);
        this.formulario.reset();
        this.foto = null;
        this.paso = 1;
      },
      error: (e) => {
        console.error('Error al registrar usuario', e);
      }
    });
  }
}
