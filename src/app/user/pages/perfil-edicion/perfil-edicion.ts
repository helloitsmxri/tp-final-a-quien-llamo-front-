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
    this.cargarDatosActuales();
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
      return;
    }

    const formData = new FormData();
    const valores = this.formulario.value;

    // Solo anexamos al FormData los campos que tengan valor para respetar el concepto de PATCH
    // acá hago un breve cambio para que el sist detecte los cambios q el usuario hace
    // por ej, si no modifica la descripción, no se envía, si la modifica se envía, si se borra se manda una cadena vacía etc
    if (this.formulario.controls.nombre.dirty){
      formData.append('nombre', valores.nombre ?? '')
    }

    if(this.formulario.controls.apellido.dirty){
      formData.append('apellido', valores.apellido ?? '')
    }
    
    if (this.formulario.controls.sobreMi.dirty){
      formData.append('sobreMi', valores.sobreMi ?? '')
    }

    if (this.formulario.controls.telefono.dirty){
      formData.append('telefono', valores.telefono ?? '');
    }

    if (this.archivoSeleccionado) {
      formData.append('foto', this.archivoSeleccionado);
    }

    // y si no modifica nada no mandamos la petición:
    if (formData.entries().next().done){
      alert('¡No realizaste ningún cambio!');
      return;
    }

    // El servicio solo ejecuta la llamada HTTP pasándole el objeto listo
    this.usuarioService.updateMyProfile(formData).subscribe({
      next: () => {
        alert ('¡Perfil actualizado con éxito!');
        //consultamos los datos actualizadosss asi y a sale como debería
        this.cargarDatosActuales();
        //limpiamos los archivos
        this.archivoSeleccionado = null;
      },
      error: () => {
        alert ('Ocurrió un error al actualizar el perfil.');
      }
    });
  }
}
