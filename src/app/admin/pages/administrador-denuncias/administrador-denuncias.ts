
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { EstadoDenuncia } from '../../../denuncia/enum/estado-denuncia';
import { DenunciaModel } from '../../../denuncia/models/denuncia-model';
import { AdministradorModel } from '../../models/AdministradorModel';
import { Subscription } from 'rxjs';
import { DenunciaService } from '../../../denuncia/services/denuncia';
import { AdminService } from '../../services/admin-service';
type FiltroDenuncia =
  | 'TODAS'
  | 'SIN_ASIGNAR'
  | 'ASIGNADAS'
  | 'MIS_CASOS'
  | 'RESUELTAS';


@Component({
  selector: 'app-administrador-denuncias',
  imports: [ReactiveFormsModule],
  templateUrl: './administrador-denuncias.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './administrador-denuncias.css',
})
export class AdministradorDenuncias {
  estadoDenuncia = EstadoDenuncia;

  denuncias: DenunciaModel[] = [];
  misDenuncias: DenunciaModel[] = [];
  administradores: AdministradorModel[] = [];

  denunciaSeleccionada: DenunciaModel | null = null;

  filtroActual: FiltroDenuncia = 'TODAS';

  buscando = false;
  cargandoMisCasos = false;
  cargandoAdministradores = false;
  cargandoFoto = false;
  procesandoAccion = false;

  busquedaControl = new FormControl('', {
    nonNullable: true
  });

  administradorControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required]
  });

  notaControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required]
  });

  fotoUrl: string | null = null;
  mostrarFoto = false;

  private fotoSubscription?: Subscription;


  constructor(
    private denunciaService: DenunciaService,
    private adminService: AdminService
  ) {}


  ngOnInit(): void {
    this.cargarDenuncias();
    this.cargarAdministradores();
  }


  ngOnDestroy(): void {
    this.liberarFoto();
  }

  cargarDenuncias(): void {

    this.buscando = true;

    this.denunciaService.obtenerTodasLasDenuncias().subscribe({

      next: (respuesta) => {
        this.denuncias = respuesta;
        this.buscando = false;

        this.actualizarSeleccion();
      },

      error: () => {
        this.buscando = false;
        alert('No se pudieron cargar las denuncias.');
      }

    });
  }

  cargarMisCasos(): void {

    this.cargandoMisCasos = true;

    this.denunciaService.obtenerMisDenunciasAdmin().subscribe({

      next: (respuesta) => {
        this.misDenuncias = respuesta;
        this.cargandoMisCasos = false;
        this.actualizarSeleccion();
      },

      error: () => {
        this.cargandoMisCasos = false;
        alert('No se pudieron cargar tus denuncias asignadas.');
      }

    });
  }

   cargarAdministradores(): void {

    this.cargandoAdministradores = true;

    this.adminService.obtenerAdministradores().subscribe({

      next: (respuesta) => {
        this.administradores = respuesta;
        this.cargandoAdministradores = false;
      },

      error: () => {
        this.cargandoAdministradores = false;
        alert('No se pudieron cargar los administradores.');
      }

    });
  }

  cambiarFiltro(filtro: FiltroDenuncia): void {

    this.filtroActual = filtro;

    this.denunciaSeleccionada = null;

    this.administradorControl.reset('');
    this.notaControl.reset('');

    this.liberarFoto();

    if (filtro === 'MIS_CASOS') {
      this.cargarMisCasos();
    }
  }


  get denunciasFiltradas(): DenunciaModel[] {

    let resultado: DenunciaModel[] = [];

    switch (this.filtroActual) {

      case 'TODAS':
        resultado = [...this.denuncias];
        break;

      case 'SIN_ASIGNAR':
        resultado = this.denuncias.filter(
          denuncia => denuncia.uuidAdministrador === null
        );
        break;

      case 'ASIGNADAS':
        resultado = this.denuncias.filter(
          denuncia =>
            denuncia.uuidAdministrador !== null &&
            !this.esResuelta(denuncia)
        );
        break;

      case 'MIS_CASOS':
        resultado = [...this.misDenuncias];
        break;

      case 'RESUELTAS':
        resultado = this.denuncias.filter(
          denuncia => this.esResuelta(denuncia)
        );
        break;
    }

    const busqueda = this.busquedaControl.value.trim().toLowerCase();

    if (busqueda) {

      resultado = resultado.filter(denuncia => {

        const nombreDenunciante =
          `${denuncia.nombreDenunciante} ${denuncia.apellidoDenunciante}`.toLowerCase();

        const nombreDenunciado =
          `${denuncia.nombreDenunciado} ${denuncia.apellidoDenunciado}`.toLowerCase();

        return nombreDenunciante.includes(busqueda) ||
               nombreDenunciado.includes(busqueda) ||
               denuncia.uuid.toLowerCase().includes(busqueda);

      });
    }

    return resultado;
  }

   seleccionarDenuncia(denuncia: DenunciaModel): void {

    this.denunciaSeleccionada = denuncia;

    this.administradorControl.reset('');
    this.notaControl.reset('');

    this.liberarFoto();

    if (denuncia.tieneFoto) {
      this.cargarFoto(denuncia.uuid);
    }
  }


  private actualizarSeleccion(): void {

    if (!this.denunciaSeleccionada) {
      return;
    }

    const uuid = this.denunciaSeleccionada.uuid;

    let actualizada: DenunciaModel | undefined;

    if (this.filtroActual === 'MIS_CASOS') {

      actualizada = this.misDenuncias.find(
        denuncia => denuncia.uuid === uuid
      );

    } else {

      actualizada = this.denuncias.find(
        denuncia => denuncia.uuid === uuid
      );

    }

    if (actualizada) {
      this.denunciaSeleccionada = actualizada;
    }
  }

  cargarFoto(uuid: string): void {

    this.fotoSubscription?.unsubscribe();

    this.liberarFoto();

    this.cargandoFoto = true;

    this.fotoSubscription = this.denunciaService.obtenerFoto(uuid).subscribe({

      next: (foto) => {

        this.fotoUrl = URL.createObjectURL(foto);

        this.cargandoFoto = false;

      },

      error: () => {

        this.cargandoFoto = false;

        alert('No se pudo cargar la fotografía de la denuncia.');

      }

    });
  }


  abrirFoto(): void {

    if (this.fotoUrl) {
      this.mostrarFoto = true;
    }

  }


  cerrarFoto(): void {
    this.mostrarFoto = false;
  }


  private liberarFoto(): void {

    this.fotoSubscription?.unsubscribe();
    this.fotoSubscription = undefined;

    if (this.fotoUrl) {
      URL.revokeObjectURL(this.fotoUrl);
      this.fotoUrl = null;
    }

    this.mostrarFoto = false;
    this.cargandoFoto = false;
  }

  asignarAdministrador(): void {

    if (!this.denunciaSeleccionada) {
      return;
    }

    if (this.administradorControl.invalid) {
      alert('Seleccioná un administrador.');
      return;
    }

    const uuidDenuncia = this.denunciaSeleccionada.uuid;
    const uuidAdministrador = this.administradorControl.value;

    this.procesandoAccion = true;

    this.denunciaService.asignarAdministrador(
      uuidDenuncia,
      uuidAdministrador
    ).subscribe({

      next: (respuesta) => {

        this.procesandoAccion = false;

        this.actualizarDenuncia(respuesta);

        alert('La denuncia fue asignada correctamente.');

      },

      error: () => {

        this.procesandoAccion = false;

        alert('No se pudo asignar la denuncia.');

      }

    });
  }

  aprobarDenuncia(): void {

    if (!this.denunciaSeleccionada || this.esResuelta(this.denunciaSeleccionada)) {
      return;
    }

    if (this.notaControl.invalid || !this.notaControl.value.trim()) {
      alert('Ingresá una nota para resolver la denuncia.');
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de que querés aprobar esta denuncia?'
    );

    if (!confirmar) {
      return;
    }

    const uuid = this.denunciaSeleccionada.uuid;
    const nota = this.notaControl.value.trim();

    this.procesandoAccion = true;

    this.denunciaService.aprobarDenuncia(uuid, nota).subscribe({

      next: (respuesta) => {

        this.procesandoAccion = false;

        this.actualizarDenuncia(respuesta);

        alert('La denuncia fue aprobada.');

      },

      error: () => {

        this.procesandoAccion = false;

        alert('No se pudo aprobar la denuncia.');

      }

    });
  }

  rechazarDenuncia(): void {

    if (!this.denunciaSeleccionada || this.esResuelta(this.denunciaSeleccionada)) {
      return;
    }

    if (this.notaControl.invalid || !this.notaControl.value.trim()) {
      alert('Ingresá una nota para resolver la denuncia.');
      return;
    }

    const confirmar = confirm(
      '¿Estás seguro de que querés rechazar esta denuncia?'
    );

    if (!confirmar) {
      return;
    }

    const uuid = this.denunciaSeleccionada.uuid;
    const nota = this.notaControl.value.trim();

    this.procesandoAccion = true;

    this.denunciaService.rechazarDenuncia(uuid, nota).subscribe({

      next: (respuesta) => {

        this.procesandoAccion = false;

        this.actualizarDenuncia(respuesta);

        alert('La denuncia fue rechazada.');

      },

      error: () => {

        this.procesandoAccion = false;

        alert('No se pudo rechazar la denuncia.');

      }

    });
  }

  private actualizarDenuncia(denuncia: DenunciaModel): void {

    const indice = this.denuncias.findIndex(
      item => item.uuid === denuncia.uuid
    );

    if (indice !== -1) {
      this.denuncias[indice] = denuncia;
    }

    const indiceMisCasos = this.misDenuncias.findIndex(
      item => item.uuid === denuncia.uuid
    );

    if (indiceMisCasos !== -1) {

      if (denuncia.uuidAdministrador === null) {
        this.misDenuncias.splice(indiceMisCasos, 1);
      } else {
        this.misDenuncias[indiceMisCasos] = denuncia;
      }

    }

    this.denunciaSeleccionada = denuncia;

    this.administradorControl.reset('');
    this.notaControl.reset('');
  }

  esResuelta(denuncia: DenunciaModel): boolean {

    return denuncia.estadoDenuncia === EstadoDenuncia.Aprobada ||
           denuncia.estadoDenuncia === EstadoDenuncia.Rechazada;

  }

  formatearFecha(fecha: string): string {

    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  }

  suspenderDenunciado(): void {

  if (!this.denunciaSeleccionada) {
    return;
  }

  const denuncia = this.denunciaSeleccionada;

  const confirmar = confirm(
    `¿Estás seguro de que querés suspender la cuenta de ${denuncia.nombreDenunciado} ${denuncia.apellidoDenunciado}?`
  );

  if (!confirmar) {
    return;
  }

  this.procesandoAccion = true;

  this.adminService.amonestarUsuario(
    denuncia.uuidDenunciado,
    denuncia.motivoDenuncia
  ).subscribe({

    next: () => {
      this.procesandoAccion = false;
      alert('La cuenta del usuario fue suspendida correctamente.');
    },

    error: (error) => {
  this.procesandoAccion = false;

  console.error('Error al suspender al usuario:', error);

  let mensaje = 'No se pudo suspender la cuenta del usuario.';

  const respuesta = error.error;

  if (typeof respuesta === 'string') {
    try {
      const datos = JSON.parse(respuesta);

      if (datos.mensaje === 'El usuario ya se encuentra suspendido.') {
        mensaje = 'Este usuario ya se encuentra suspendido.';
      }
    } catch {
      // La respuesta no contiene un JSON válido.
    }
  } else if (respuesta?.mensaje === 'El usuario ya se encuentra suspendido.') {
    mensaje = 'Este usuario ya se encuentra suspendido.';
  }

  alert(mensaje);
}

  });
}
}
