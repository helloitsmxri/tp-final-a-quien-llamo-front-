import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsuarioService } from '../../services/user';

@Component({
  selector: 'app-perfil-edicion',
  imports: [ReactiveFormsModule],
  templateUrl: './perfil-edicion.html',
  styleUrl: './perfil-edicion.css',
})
export class PerfilEdicion implements OnInit {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);

  archivoSeleccionado : File | null = null;

  ngOnInit() : void {
  }

  formulario = this.fb.group({
    nombre : ['', [Validators.minLength(2)]],
    apellido : ['', [Validators.minLength(2)]],
    telefono : ['', [Validators.pattern(/^\d{10}$/)]],
    sobreMi : ['', [Validators.pattern(/.*\S.*/)]]
  })

  cargarDatosActuales(){
    this.usuarioService.getMyProfile().subscribe({
      next : (perfil) => {this.formulario.patchValue({
        nombre : perfil.nombre,
        apellido : perfil.apellido,
        telefono: perfil.telefono,
        sobreMi : perfil.sobreMi
      });
    },
    error : () => {alert('¡Error al editar perfil!')}
    })
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  onSubmit() {
    if (this.formulario.invalid) {
      alert ('Por favor, revisá los campos.');
    }

    const formData = new FormData();
    const valores = this.formulario.value;

    // Solo anexamos al FormData los campos que tengan valor para respetar el concepto de PATCH
    if (valores.nombre) formData.append('nombre', valores.nombre);
    if (valores.apellido) formData.append('apellido', valores.apellido);
    if (valores.telefono) formData.append('telefono', valores.telefono);
    if (valores.sobreMi) formData.append('sobreMi', valores.sobreMi);

    if (this.archivoSeleccionado) {
      formData.append('foto', this.archivoSeleccionado);
    }

    // El servicio solo ejecuta la llamada HTTP pasándole el objeto listo
    this.usuarioService.updateMyProfile(formData).subscribe({
      next: () => {
        alert ('¡Perfil actualizado con éxito!');
      },
      error: () => {
        alert ('Ocurrió un error al actualizar el perfil.');
      }
    });
  }
}
