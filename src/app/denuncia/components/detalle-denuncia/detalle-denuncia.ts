import { DatePipe } from '@angular/common';
import { Component, HostListener, inject, Input, SimpleChanges } from '@angular/core';
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
export class DetalleDenuncia {
  private denunciaService = inject(DenunciaService);

  @Input({required : true}) denuncia !: DenunciaModel;
  fotoUrl : string | null = null;
  cargandoFoto = false;

  private suscripcionFoto ?: Subscription;

  // CONTROLAR LA VISUALIZACIÓN DE LA FOTO
  mostrarFotoAmpliada = false;

  // ABRIR FOTO AMPLIADA
  abrirFoto() {
      if (this.fotoUrl) {
          this.mostrarFotoAmpliada = true;
      }
  }

  // CERRAR FOTO AMPLIADA
  cerrarFoto() {
      this.mostrarFotoAmpliada = false;
  }

  // CERRAR AL PRESIONAR ESCAPE
  @HostListener('document:keydown.escape')
  cerrarConEscape() {
      this.cerrarFoto();
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

  // limpiar la foto - libera la foto anterior-
  limpiarFoto(){
    this.suscripcionFoto?.unsubscribe();
    this.suscripcionFoto = undefined;

    if (this.fotoUrl){
      URL.revokeObjectURL(this.fotoUrl);
      this.fotoUrl = null;
    }

    this.cargandoFoto = false;
    this.mostrarFotoAmpliada = false;
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
