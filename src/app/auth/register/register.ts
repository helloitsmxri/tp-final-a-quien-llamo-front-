import { Component, inject } from '@angular/core';
import {AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import { Calendario } from '../../components/calendario/calendario';
import { AuthService } from '../services/auth-service';
import { switchMap } from 'rxjs';

// Validador del grupo: compara "clave" con "repetirClave"
function clavesIguales(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('clave')?.value === grupo.get('repetirClave')?.value
    ? null
    : { clavesDistintas: true };
}

// para validar la edad
function validarEdad(control : AbstractControl) : ValidationErrors | null{
  if (!control.value){
    return null;
  }

  const [anio, mes, dia] = control.value.split('-').map(Number);

  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;

  // si no cumple todavía se le resta UN año.
  if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)){
    edad --;
  }

  return edad >= 18 ? null : {
    menorDeEdad : true
  }
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
    clave: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/)]],
    repetirClave: ['', [Validators.required]],
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[\p{L}\s]+$/u)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[\p{L}\s]+$/u)]],
 
    // Paso 2
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    fechaNacimiento: ['', [Validators.required, validarEdad]],
    telefono: ['', [Validators.required, Validators.maxLength(10), Validators.pattern(/^\d{10}$/)]],
    sobreMi: ['', [Validators.required, Validators.maxLength(500)]],
  }, { validators: clavesIguales });
 
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

  if (c.hasError('pattern')) {

    if (campo === 'clave') {
      return 'Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
    }

    if (campo === 'nombre' || campo === 'apellido') {
      return 'Solo se permiten letras y espacios, sin números ni símbolos.';
    }

    if (campo === 'dni') {
      return 'El DNI debe tener exactamente 8 números.';
    }

    if (campo === 'telefono') {
      return 'El teléfono debe tener exactamente 10 números.';
    }
  }

  if (c.hasError('menorDeEdad')) {
    return 'Tenés que ser mayor de 18 años para poder registrarte en la plataforma.';
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
        const archivo = input.files[0];

      if (archivo.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5 MB.');
        input.value = '';
        this.foto = null;
        return;
      }

      this.foto = archivo;
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
 
    // primero registra al usuario, dsps inicia sesión
    this.uService.store(formData).pipe(
      switchMap(() => {
        return this.uService.login({
          username : datos.email ?? '',
          password : datos.clave ?? ''
        })
      })
    ).subscribe({
      next : () => {
        alert ('¡Se creó e inició sesión correctamente!');
        this.formulario.reset();
        this.foto = null;
        this.paso = 1;
      },
      error : () => {
        alert ('Error durante su registro o inicio de sesión.');
      }
    })
  }
}
