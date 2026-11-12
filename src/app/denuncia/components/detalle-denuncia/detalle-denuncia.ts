import { DatePipe } from '@angular/common';
import { Component, ElementRef, HostListener, inject, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { DenunciaService } from '../../services/denuncia';
import { DenunciaModel } from '../../models/denuncia-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detalle-denuncia',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './detalle-denuncia.html',
  styleUrl: './detalle-denuncia.css',
})
export class DetalleDenuncia implements OnChanges, OnDestroy {
  private denunciaService = inject(DenunciaService);

  @Input({required : true}) denuncia !: DenunciaModel;
  fotoUrl : string | null = null;
  cargandoFoto = false;

  private suscripcionFoto ?: Subscription;

  // REFERENCIAS A LOS ELEMENTOS DEL VISOR
  @ViewChild('visorContenido') visorContenido!: ElementRef<HTMLElement>;
  @ViewChild('botonCerrar') botonCerrar!: ElementRef<HTMLButtonElement>;

  private elementoAnterior : HTMLElement | null = null;
  private overFlowAnterior = '';

  // CONTROLAR LA VISUALIZACIÓN DE LA FOTO
  mostrarFotoAmpliada = false;

  // ABRIR FOTO AMPLIADA
  abrirFoto() {
      if (!this.fotoUrl) {
          return;
      }

      this.elementoAnterior = document.activeElement as HTMLElement;
      this.overFlowAnterior = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      this.mostrarFotoAmpliada = true;

      // esperar a q aparezca el visor para mover el foco
      setTimeout(() => {
        this.botonCerrar?.nativeElement.focus();
      })
  }

  // CERRAR FOTO AMPLIADA
  cerrarFoto() {
     if (!this.mostrarFotoAmpliada){
      return;
     }

     this.mostrarFotoAmpliada = false;
     document.body.style.overflow = this.overFlowAnterior;

     // devolver el foco al elemnto q abrió el visor
     setTimeout(() => {this.elementoAnterior?.focus()
                       this.elementoAnterior = null;
     })
  }

  // cargar la foto de la denuncia
  cargarFoto(){
    this.limpiarFoto();
    if (!this.denuncia.tieneFoto){
      return;
    }
    this.cargandoFoto = true;
    this.suscripcionFoto = this.denunciaService.obtenerFoto(this.denuncia.uuid).subscribe(
      {
        next : (foto) => {this.fotoUrl = URL.createObjectURL(foto);
                          this.cargandoFoto = false;   
      },
      error : (error) => {
        this.cargandoFoto = false;
        alert ('No se pudo cargar la foto adjunta.' + error);
      }
      }
    )
  }

   // CONTROLAR EL TECLADO MIENTRAS EL VISOR ESTÁ ABIERTO
    @HostListener('document:keydown', ['$event'])
    manejarTeclado(event: KeyboardEvent) {
        if (!this.mostrarFotoAmpliada) {
            return;
        }

        if (!this.visorContenido) {
            return;
        }

        // CERRAR CON ESCAPE
        if (event.key === 'Escape') {
            event.preventDefault();
            this.cerrarFoto();
            return;
        }

        // MANTENER EL FOCO DENTRO DEL VISOR
        if (event.key === 'Tab') {
            const elementos = this.visorContenido.nativeElement.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );

            const primero = elementos[0];
            const ultimo = elementos[elementos.length - 1];

            if (!primero || !ultimo) {
                event.preventDefault();
                return;
            }

            if (event.shiftKey && document.activeElement === primero) {
                event.preventDefault();
                ultimo.focus();
            } else if (!event.shiftKey && document.activeElement === ultimo) {
                event.preventDefault();
                primero.focus();
            }
        }
    }

  // limpiar la foto - libera la foto anterior-
  limpiarFoto() {
      this.suscripcionFoto?.unsubscribe();
      this.suscripcionFoto = undefined;

      if (this.fotoUrl) {
          URL.revokeObjectURL(this.fotoUrl);
          this.fotoUrl = null;
      }

      if (this.mostrarFotoAmpliada) {
          this.mostrarFotoAmpliada = false;
          document.body.style.overflow = this.overFlowAnterior;

          setTimeout(() => {
              this.elementoAnterior?.focus();
              this.elementoAnterior = null;
          });
      }

    this.cargandoFoto = false;
  }

  // DETECTAR Q CAMBIA LA DENUNCIA
  ngOnChanges(changes : SimpleChanges){
    if (changes['denuncia'] && this.denuncia){
      this.cargarFoto();
    }
  }

  // LIBERAR RECURSOS AL DESTRUIR EL COMPONENTE
    ngOnDestroy() {
        this.limpiarFoto();
    }
}
