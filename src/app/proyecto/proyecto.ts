import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProyectoService } from './services/proyecto-service';
import { SEPARADOR } from './utils/proyecto-texto';
import { ProyectoModel } from './models/ProyectoModel';

//el — es el separador entre titulo y detalle, asi q no puede estar en el titulo
function sinSeparador(control: AbstractControl): ValidationErrors | null {
  return String(control.value ?? '').includes(SEPARADOR) ? { separador: true } : null;
}

@Component({
  selector: 'app-proyecto',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './proyecto.html',
  styleUrl: './proyecto.css',
})

export class Proyecto implements OnInit {
  private service = inject(ProyectoService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  //uuid del tecnico por @Input y si no viene lo saca de la ruta (perfil-tecnico/:uuid/proyectos)
  @Input() uuid: string | null = null;
  //false: solo lista (para mostrarlo dentro del perfil publico)
  @Input() editable = true;

  proyectos: ProyectoModel[] = [];
  cargando = true;
  guardando = false;
  mostrarForm = false;
  indiceEditando: number | null = null;
  error: string | null = null;
  exito: string | null = null;

  formulario = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), sinSeparador]],
    detalle: ['', [Validators.maxLength(200)]],
  });

  get titulo() {
    return this.formulario.controls.titulo;
  }

  get detalle() {
    return this.formulario.controls.detalle;
  }

  private get uuidTecnico(): string {
    return this.uuid ?? this.route.snapshot.paramMap.get('uuid') ?? '';
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = null;

    this.service.listar(this.uuidTecnico).subscribe({
      next: (lista) => {
        this.proyectos = lista;
        this.cargando = false;
      },
      error: (e) => {
        this.error = this.mensajeDe(e, 'No se pudieron cargar los proyectos.');
        this.cargando = false;
      },
    });
  }

  nuevo(): void {
    this.indiceEditando = null;
    this.formulario.reset({ titulo: '', detalle: '' });
    this.mostrarForm = true;
    this.limpiarMensajes();
  }

  editar(indice: number): void {
    const p = this.proyectos[indice];
    this.indiceEditando = indice;
    this.formulario.reset({ titulo: p.titulo, detalle: p.detalle });
    this.mostrarForm = true;
    this.limpiarMensajes();
  }

  cancelar(): void {
    this.mostrarForm = false;
    this.indiceEditando = null;
    this.formulario.reset({ titulo: '', detalle: '' });
  }

  guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const proyecto: ProyectoModel = {
      titulo: this.titulo.value ?? '',
      detalle: this.detalle.value ?? '',
    };
    const indice = this.indiceEditando;
    const peticion =
      indice === null
        ? this.service.agregar(this.uuidTecnico, proyecto)
        : this.service.modificar(this.uuidTecnico, indice, proyecto);

    this.limpiarMensajes();
    this.guardando = true;

    peticion.subscribe({
      next: (lista) => {
        this.proyectos = lista;
        this.exito = indice === null ? 'Proyecto agregado.' : 'Proyecto modificado.';
        this.guardando = false;
        this.cancelar();
      },
      error: (e) => {
        this.error = this.mensajeDe(e, 'No se pudo guardar el proyecto.');
        this.guardando = false;
      },
    });
  }

  eliminar(indice: number): void {
    const p = this.proyectos[indice];
    if (!confirm(`¿Eliminar el proyecto "${p.titulo}"?`)) {
      return;
    }

    this.limpiarMensajes();
    this.guardando = true;

    this.service.eliminar(this.uuidTecnico, indice).subscribe({
      next: (lista) => {
        this.proyectos = lista;
        this.exito = 'Proyecto eliminado.';
        this.guardando = false;
      },
      error: (e) => {
        this.error = this.mensajeDe(e, 'No se pudo eliminar el proyecto.');
        this.guardando = false;
      },
    });
  }

  private limpiarMensajes(): void {
    this.error = null;
    this.exito = null;
  }

  //mensajes de error personalizados
  errorTitulo(): string {
    const c = this.formulario.controls.titulo;

    if (c.hasError('required')) {
      return 'El título es obligatorio.';
    }
    if (c.hasError('minlength')) {
      return 'El título debe tener al menos 3 caracteres.';
    }
    if (c.hasError('maxlength')) {
      return 'El título no debe superar los 100 caracteres.';
    }
    if (c.hasError('separador')) {
      return 'El título no puede contener " — ".';
    }
    return '';
  }

  errorDetalle(): string {
    const c = this.formulario.controls.detalle;

    if (c.hasError('maxlength')) {
      return 'El detalle no debe superar los 200 caracteres.';
    }
    return '';
  }

  //errores propios (Error), del back ({ mensaje })
  private mensajeDe(e: unknown, porDefecto: string): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 401 || e.status === 403) {
        return 'No tenés permiso para modificar estos proyectos. Iniciá sesión como técnico.';
      }
      return e.error?.mensaje ?? porDefecto;
    }
    return e instanceof Error ? e.message : porDefecto;
  }
}