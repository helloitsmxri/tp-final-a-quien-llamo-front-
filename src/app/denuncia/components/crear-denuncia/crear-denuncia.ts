import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DenunciaService } from '../../services/denuncia';
import { DenunciaModel } from '../../models/denuncia-model';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-crear-denuncia',
  imports: [ReactiveFormsModule],
  templateUrl: './crear-denuncia.html',
  styleUrl: './crear-denuncia.css',
})
export class CrearDenuncia {
  private denunciaService = inject(DenunciaService);
  private location = inject(Location);

  // datos q recibe del chat o del perfil:
  @Input() origen: 'CHAT' | 'PERFIL' = 'PERFIL';
@Input() uuidReferencia = '';

  // datos q envía al componente padre
  @Output() cancelar = new EventEmitter<void>();
  @Output() denunciaCreada = new EventEmitter<DenunciaModel>();

  private route = inject(ActivatedRoute);

  constructor() {
  this.route.queryParams.subscribe(params => {

    const uuidChat = params['uuidChat'];
    const uuidDenunciado = params['uuidDenunciado'];

    if (uuidChat) {
      this.origen = 'CHAT';
      this.uuidReferencia = uuidChat;
    } else {
      this.origen = 'PERFIL';
      this.uuidReferencia = uuidDenunciado || '';
    }

    console.log('Origen de denuncia:', this.origen);
    console.log('UUID de referencia:', this.uuidReferencia);
    console.log('UUID denunciado:', uuidDenunciado);
  });
}

  // form d denuncia
  formulario = new FormGroup({
    motivoDenuncia: new FormControl('', {nonNullable: true, validators: [Validators.required,  Validators.pattern('.*\\S.*')]})
  })

  // foto q se puede adjuntar
  fotoSeleccionada : File | null = null;

  // control de confirmación
  mostrarConfirmacion = false;

  // estados del envío d esta operacion
  enviando = false;

      // SELECCIONAR FOTO
    seleccionarFoto(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            this.fotoSeleccionada = input.files[0];
        }
    }

    // QUITAR FOTO
    quitarFoto() {
        this.fotoSeleccionada = null;
    }

    // VALIDAR FORMULARIO Y MOSTRAR CONFIRMACIÓN
   confirmarEnvio() {

    const c = this.formulario.controls;

    if (this.formulario.invalid) {
        this.formulario.markAllAsTouched();

        if (c.motivoDenuncia.hasError('required') ||
            c.motivoDenuncia.hasError('pattern')) {
            alert('Debe incluir el motivo por el cual está denunciando.');
        }
        return;
    }
      this.mostrarConfirmacion = true;
    }

    // CANCELAR CONFIRMACIÓN
    cancelarConfirmacion() {
        this.mostrarConfirmacion = false;
    }

    // ENVIAR DENUNCIA AL BACKEND
    enviarDenuncia() {

        if (this.enviando) {
            return;
        }

        const c = this.formulario.controls;

        const motivo = c.motivoDenuncia.value;

        if (!this.uuidReferencia) {
  alert('No se pudo identificar al usuario que querés denunciar.');
  console.error('UUID de referencia:', this.uuidReferencia);
  return;
}

        this.enviando = true;

        // DENUNCIAR DESDE UN CHAT
        const peticion = this.origen === 'CHAT'
            ? this.denunciaService.crearDenunciaChat(
                this.uuidReferencia,
                motivo,
                this.fotoSeleccionada ?? undefined
            )

            // DENUNCIAR DESDE UN PERFIL
            : this.denunciaService.crearDenunciaPerfil(
                this.uuidReferencia,
                motivo,
                this.fotoSeleccionada ?? undefined
            );

        peticion.subscribe({
            next: (respuesta) => {
                this.enviando = false;
                this.mostrarConfirmacion = false;

                alert('La denuncia se realizó correctamente.');

                this.denunciaCreada.emit(respuesta);
            },
            error: (error) => {
                this.enviando = false;

                console.error('Error al crear la denuncia:', error);

                alert('No se pudo enviar la denuncia. Intentá nuevamente.');
            }
        });
    }

    cancelarFormulario() {
    this.location.back();
}


}
