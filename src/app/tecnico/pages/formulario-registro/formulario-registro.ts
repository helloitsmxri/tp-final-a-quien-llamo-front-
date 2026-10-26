import { Component, inject } from '@angular/core';
import { DetalleHabilidad } from '../../../habilidad/pages/detalle-habilidad/detalle-habilidad';
import { DetalleEspecialidad } from '../../../especialidad/pages/detalle-especialidad/detalle-especialidad';
import { DetalleRubro } from '../../../rubro/pages/detalle-rubro/detalle-rubro';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TecnicoService } from '../../services/tecnico';
import { Router } from '@angular/router';
import { RubroModel } from '../../../rubro/models/rubro-model';
import { TecnicoModel } from '../../models/tecnico-model';
import { EspecialidadModel } from '../../../especialidad/models/especialidad-model';

const CLAVE= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
function clavesIguales(grupo: AbstractControl): ValidationErrors | null {
  return grupo.get('clave')?.value === grupo.get('repetirClave')?.value
    ? null
    : { clavesDistintas: true };
}
@Component({
  selector: 'app-formulario-registro',
  imports: [ReactiveFormsModule, DetalleRubro, DetalleEspecialidad, DetalleHabilidad],
  templateUrl: './formulario-registro.html',
  styleUrl: './formulario-registro.css',
})
export class FormularioRegistro {
  private servicioTecnico = inject(TecnicoService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  foto: File | null = null;

  //pasos
  paso=1
  readonly totalPasos=3

  private camposPorPaso: Record<number, string[]>={
    1: ['email', 'clave', 'repetirClave', 'nombre', 'apellido'],
    2: ['dni', 'fechaNacimiento', 'telefono', 'sobreMi'],
    3: ['cuit', 'descripcionTrabajo', 'proyectos']
  }

  formulario = this.fb.group({
     email: ['', [Validators.required, Validators.email]],
      clave: ['', [Validators.required, Validators.minLength(8), Validators.pattern(CLAVE)]],
      repetirClave: ['', [Validators.required]],
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],

      // Paso 2: datos personales
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      fechaNacimiento: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      sobreMi: ['', [Validators.required]],

      // Paso 3: datos de técnico
      cuit: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      descripcionTrabajo: ['', [Validators.required, Validators.minLength(10)]],
      proyectos: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
    },
    { 
      validators: clavesIguales 
    }
  );

  especialidadesDelRubro: string[]=[]
  nombresEspecialidades: string[]=[]
  uuidEspecialidades: string[]=[]
  uuidHabilidades: string[]=[]
  errorSeleccion: string | null = null;
  errorServidor: string | null = null;
  enviado=false

  onRubro(rubro: RubroModel | null): void {
    this.especialidadesDelRubro = rubro?.especialidades ?? [];
  }

  onEspecialidades(lista: EspecialidadModel[]): void {
    this.uuidEspecialidades = lista.map(e => e.uuid);
    this.nombresEspecialidades = lista.map(e => e.nombreEspecialidad);
  }

  onHabilidades(uuid: string[]): void {
    this.uuidHabilidades = uuid;
  }

  errorMensaje(campo: string): string | null {
    const c = this.formulario.get(campo);
    if (!c || !c.touched) return null;

    if (c.hasError('required')) return 'Este campo es obligatorio.';

    if (campo === 'repetirClave' && this.formulario.hasError('clavesDistintas')) {
      return 'Las contraseñas no coinciden.';
    }
    if (c.hasError('email')) return 'Ingresá un email válido.';

    if (c.hasError('minlength')) {
      return `Debe tener al menos ${c.errors?.['minlength'].requiredLength} caracteres.`;
    }
    if (c.hasError('maxlength')) {
      return `No puede superar los ${c.errors?.['maxlength'].requiredLength} caracteres.`;
    }

    if (c.hasError('pattern')) {
      switch (campo) {
        case 'clave': return 'Debe tener mayúscula, minúscula, número y un carácter especial (@$!%*?&).';
        case 'dni': return 'El DNI debe tener 8 números.';
        case 'telefono': return 'El teléfono debe tener 10 números, sin guiones ni espacios.';
        case 'cuit': return 'El CUIT debe tener 11 números, sin guiones.';
      }
    }
    return null;
  }

  //navegar entre pasos
  private pasoValido(paso: number): boolean {
    const controles=this.camposPorPaso[paso].map(campo => this.formulario.get(campo));
    controles.forEach(c=> c?.markAllAsTouched())

    const clavesConfirmadas= paso!==1 || !this.formulario.hasError('clavesDistintas');
    return controles.every(c=> c?.valid) && clavesConfirmadas;
  }

  siguiente(): void {
    if(this.paso<this.totalPasos && this.pasoValido(this.paso)){
      this.paso++
    }
  }

  volver(): void {
    if(this.paso>1){
      this.paso--
    }
  }

  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.foto=input.files && input.files.length>0 ? input.files[0] : null;
  }

  guardar(): void {
    //enter en los pasos 1 y 2 avanza en vez de enviar
    if (this.paso < this.totalPasos) {
      this.siguiente();
      return;
    }

    if (!this.pasoValido(3)){
      return;
    } 

    if (!this.uuidEspecialidades.length || !this.uuidHabilidades.length) {
      this.errorSeleccion = 'Elegí al menos una especialidad y una habilidad.';
      return;
    }

    this.errorSeleccion = null;
    this.errorServidor = null;

    const v = this.formulario.getRawValue();
    const fd = new FormData();

    //el back usa @ModelAttribute: las claves llevan el prefijo "usuario." / "tecnico."
    fd.append('usuario.nombre', v.nombre ?? '');
    fd.append('usuario.apellido', v.apellido ?? '');
    fd.append('usuario.dni', v.dni ?? '');
    fd.append('usuario.email', v.email ?? '');
    fd.append('usuario.clave', v.clave ?? '');
    fd.append('usuario.telefono', v.telefono ?? '');
    fd.append('usuario.fechaNacimiento', this.formatearFecha(v.fechaNacimiento ?? ''));
    fd.append('usuario.sobreMi', v.sobreMi ?? '');
    if (this.foto) fd.append('usuario.foto', this.foto);

    fd.append('tecnico.cuit', v.cuit ?? '');
    fd.append('tecnico.descripcionTrabajo', v.descripcionTrabajo ?? '');
    fd.append('tecnico.proyectos', v.proyectos ?? '');
    //las listas se mandan repitiendo la clave
    this.uuidEspecialidades.forEach(u => fd.append('tecnico.uuidEspecialidades', u));
    this.uuidHabilidades.forEach(u => fd.append('tecnico.uuidHabilidades', u));


    this.enviado = true;
    
    this.servicioTecnico.crearTecnico(fd).subscribe({
      next: () => {
        this.enviado = false;
        this.router.navigate(['/iniciar-sesion']);
      },
      error: (e) => {
        this.enviado = false;
        console.error('Error al registrar técnico', e);
        this.errorServidor = e?.error?.message ?? 'No se pudo completar el registro.';
      },
    });
  }

  //el back espera dd/MM/yyyy; un <input type="date"> entrega yyyy-MM-dd
  private formatearFecha(fecha: string): string {
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha.split('-').reverse().join('/') : fecha;
  }
}

