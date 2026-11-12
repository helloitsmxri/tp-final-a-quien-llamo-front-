import { Component, inject } from '@angular/core';
import { DenunciaService } from '../../services/denuncia';
import { EstadoDenuncia } from '../../enum/estado-denuncia';
import { DenunciaModel } from '../../models/denuncia-model';

@Component({
  selector: 'app-mis-denuncias',
  imports: [],
  templateUrl: './mis-denuncias.html',
  styleUrl: './mis-denuncias.css',
})
export class MisDenuncias {
private denunciaService = inject(DenunciaService);

  // PERMITE UTILIZAR EL ENUM DESDE EL HTML
  estados = EstadoDenuncia;

  // LISTA DE DENUNCIAS RECIBIDAS DEL BACKEND
  denuncias: DenunciaModel[] = [];

  // PESTAÑA SELECCIONADA
  tipoSeleccionado: 'CREADAS' | 'RECIBIDAS' = 'CREADAS';

  // FILTRO DE ESTADO
  estadoSeleccionado: 'TODOS' | EstadoDenuncia = 'TODOS';

  // DENUNCIA SELECCIONADA PARA VER SU DETALLE
  denunciaSeleccionada: DenunciaModel | null = null;

  cargando = false;
  error = false;

  ngOnInit(): void {
    this.cargarDenuncias();
  }

  // CARGAR DENUNCIAS
  cargarDenuncias(): void {

    this.cargando = true;
    this.error = false;
    this.denuncias = [];
    this.denunciaSeleccionada = null;

    this.denunciaService.obtenerMisDenuncias(this.tipoSeleccionado)
      .subscribe({

        next: (datos) => {
          this.denuncias = datos;
          this.cargando = false;
        },

        error: (err) => {
          console.error('Error al obtener las denuncias', err);
          this.error = true;
          this.cargando = false;
        }

      });
  }

  // CAMBIAR ENTRE CREADAS Y RECIBIDAS
  cambiarTipo(tipo: 'CREADAS' | 'RECIBIDAS'): void {

    this.tipoSeleccionado = tipo;
    this.estadoSeleccionado = 'TODOS';
    this.denunciaSeleccionada = null;

    this.cargarDenuncias();
  }

  // FILTRAR POR ESTADO
  filtrarPorEstado(estado: 'TODOS' | EstadoDenuncia): void {

    this.estadoSeleccionado = estado;
    this.denunciaSeleccionada = null;
  }

  // OBTENER DENUNCIAS FILTRADAS
  get denunciasFiltradas(): DenunciaModel[] {

    if (this.estadoSeleccionado === 'TODOS') {
      return this.denuncias;
    }

    return this.denuncias.filter(
      denuncia => denuncia.estadoDenuncia === this.estadoSeleccionado
    );
  }

  // SELECCIONAR UNA DENUNCIA PARA VER SU DETALLE
  seleccionarDenuncia(denuncia: DenunciaModel): void {

    this.denunciaSeleccionada = denuncia;
  }

  // MENSAJE CUANDO NO HAY DENUNCIAS
  get mensajeSinDenuncias(): string {

    if (this.tipoSeleccionado === 'CREADAS') {
      return '¡Todavía no realizaste ninguna denuncia!';
    }

    return '¡No tenés denuncias recibidas!';
  }

}
