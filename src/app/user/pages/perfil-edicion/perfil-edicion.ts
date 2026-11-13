import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UsuarioService } from '../../services/user';
import { UserProfileDTO } from '../../models/user-profile-DTO';

// Mismo tamaño máximo que la edición de técnico.
// Tiene que coincidir con spring.servlet.multipart.max-file-size del back.
const TAMANO_MAXIMO_MB = 10;

@Component({
  selector: 'app-perfil-edicion',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './perfil-edicion.html',
  styleUrl: './perfil-edicion.css',
})
export class PerfilEdicion implements OnInit, OnDestroy {

  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private router = inject(Router);

  perfil: UserProfileDTO | null = null;
  errorCarga = false;

  // Formulario de edición
  formulario = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/.*\S.*/)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/.*\S.*/)]],
    telefono: ['', [Validators.pattern(/^\d{10}$/)]],
    sobreMi: ['', [Validators.pattern(/.*\S.*/)]],
  });

  // Foto
  fotoSeleccionada: File | null = null;
  fotoPreview: string | null = null;
  errorFoto: string | null = null;
  iniciales = '';

  errorServidor: string | null = null;
  guardando = false;

  ngOnInit(): void {
    this.usuarioService.getMyProfile().subscribe({
      next: (perfil) => {
        this.perfil = perfil;

        this.formulario.patchValue({
          nombre: perfil.nombre ?? '',
          apellido: perfil.apellido ?? '',
          telefono: perfil.telefono ?? '',
          sobreMi: perfil.sobreMi ?? '',
        });

        // Igual que en la edición de técnico
        if (perfil.foto && perfil.tipoImagen) {
          this.fotoPreview = `data:${perfil.tipoImagen};base64,${perfil.foto}`;
        }

        this.iniciales = (
          (perfil.nombre?.charAt(0) ?? '') + (perfil.apellido?.charAt(0) ?? '')
        ).toUpperCase();
      },
      error: () => {
        this.errorCarga = true;
      },
    });
  }

  // Libera la vista previa temporal al salir de la pantalla
  ngOnDestroy(): void {
    this.liberarVistaPrevia();
  }

  // Seleccionar foto
  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    if (!archivo.type.startsWith('image/')) {
      this.errorFoto = 'El archivo seleccionado debe ser una imagen.';
      input.value = '';
      return;
    }

    if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      this.errorFoto = `La imagen no puede superar los ${TAMANO_MAXIMO_MB} MB.`;
      input.value = '';
      return;
    }

    this.errorFoto = null;

    // Liberar la vista previa anterior si era una URL temporal
    this.liberarVistaPrevia();

    this.fotoSeleccionada = archivo;
    this.fotoPreview = URL.createObjectURL(archivo);
  }

  private liberarVistaPrevia(): void {
    if (this.fotoPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(this.fotoPreview);
    }
  }

  // Mensajes de validación
  errorMensaje(campo: 'nombre' | 'apellido' | 'telefono' | 'sobreMi'): string | null {

    const control = this.formulario.get(campo);

    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.hasError('required')) {
      return 'Este campo es obligatorio.';
    }

    if (control.hasError('minlength')) {
      return 'Ingresá al menos 2 caracteres.';
    }

    if (campo === 'telefono') {
      return 'Ingresá 10 dígitos, sin 0 ni 15 (ej: 1123456789).';
    }

    return 'No puede estar vacío ni tener solo espacios.';
  }

  // Guardar los cambios
  guardar(): void {
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid || this.errorFoto) {
      return;
    }

    // Evitar envíos repetidos
    if (this.guardando) {
      return;
    }

    // Si ningún campo cambió y no hay foto nueva, no hay nada que enviar
    if (!this.formulario.dirty && !this.fotoSeleccionada) {
      this.errorServidor = 'No realizaste ningún cambio.';
      return;
    }

    const v = this.formulario.getRawValue();
    const campos = this.formulario.controls;

    // Solo se envían los campos que el usuario modificó (concepto de PATCH)
    const datos = new FormData();

    if (campos.nombre.dirty) {
      datos.append('nombre', (v.nombre ?? '').trim());
    }

    if (campos.apellido.dirty) {
      datos.append('apellido', (v.apellido ?? '').trim());
    }

    if (campos.telefono.dirty) {
      datos.append('telefono', (v.telefono ?? '').trim());
    }

    if (campos.sobreMi.dirty) {
      datos.append('sobreMi', (v.sobreMi ?? '').trim());
    }

    if (this.fotoSeleccionada) {
      datos.append('foto', this.fotoSeleccionada);
    }

    this.errorServidor = null;
    this.guardando = true;

    this.usuarioService.updateMyProfile(datos).subscribe({
      next: () => {
        this.guardando = false;
        this.router.navigate(['/mi-perfil']);
      },
      error: (e) => {
        this.guardando = false;

        this.errorServidor =
          e?.error?.mensaje ??
          e?.error?.message ??
          'No se pudo guardar el perfil.';
      },
    });
  }
}