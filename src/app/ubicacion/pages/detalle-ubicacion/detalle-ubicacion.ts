
import { AfterViewInit, Component, NgZone, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UbicacionModel } from '../../models/ubicacion-model';
import { GoogleMapsModel } from '../../models/GoogleMapsModel';
import { UbicacionService } from '../../services/ubicacion-service';
import { GoogleMapsLoader } from '../../services/google-maps-loader';
import { UsuarioService } from '../../../user/services/user';

// Google Maps se carga por script; así evitamos instalar los tipos
declare const google: any;

// Centro por defecto del mapa: Mar del Plata
const CENTRO_POR_DEFECTO = { lat: -38.0055, lng: -57.5426 };
const CIUDAD_POR_DEFECTO = 'Mar del Plata';

@Component({
  imports: [FormsModule],
  selector: 'app-detalle-ubicacion',
  styleUrl: './detalle-ubicacion.css',
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './detalle-ubicacion.html',
})
export class DetalleUbicacion implements OnInit, AfterViewInit {

  currentUuidUsuario: string = '';

  // 1. Lista de ubicaciones guardadas
  ubicaciones: UbicacionModel[] = [];

  // 2. Variables para la búsqueda en Google Maps
  busquedaDireccion: string = '';
  resultadoMaps: GoogleMapsModel | null = null;
  cargandoMaps: boolean = false;

  // 3. Formulario
  formData: UbicacionModel = {
    calle: '',
    numero: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    piso: '',
    numeroPiso: ''
  };

  // Para saber si estamos editando una ubicación existente o creando una nueva
  ubicacionEditandoUuid: string | null = null;

  private map: any;
  private marker: any;

  constructor(
    private ubicacionService: UbicacionService,
    private usuarioService: UsuarioService,
    private mapsLoader: GoogleMapsLoader,
    private route: ActivatedRoute,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    // El uuid real del usuario sale de su perfil
    this.usuarioService.getMyProfile().subscribe({
      next: (perfil) => {
        this.currentUuidUsuario = perfil.uuid;
        this.cargarUbicaciones();
      },
      error: (err) => console.error('No se pudo obtener el perfil:', err),
    });
  }

  ngAfterViewInit(): void {
    this.initMap().then(() => {
      // Si venimos del inicio con ?busqueda=..., buscamos esa dirección
      const busqueda = this.route.snapshot.queryParamMap.get('busqueda');
      if (busqueda) {
        this.ngZone.run(() => {
          this.busquedaDireccion = busqueda;
          this.buscarEnMaps();
        });
      }
    });
  }

  // Inicializa el mapa de Google centrado en Mar del Plata
  private async initMap(): Promise<void> {
    try {
      await this.mapsLoader.cargar();

      const { Map: GMap } = await google.maps.importLibrary('maps');
      const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');

      this.map = new GMap(document.getElementById('mapa-container'), {
        center: CENTRO_POR_DEFECTO,
        zoom: 13,
        mapId: 'DEMO_MAP_ID', // requerido por los marcadores avanzados; en producción usá tu propio Map ID
      });

      this.marker = new AdvancedMarkerElement({
        map: this.map,
        position: CENTRO_POR_DEFECTO,
      });
    } catch (err) {
      console.error('No se pudo iniciar Google Maps:', err);
    }
  }

  // Carga inicial de las ubicaciones del usuario
  cargarUbicaciones(): void {
    this.ubicacionService.getByUsuario(this.currentUuidUsuario).subscribe({
      next: (data) => {
        this.ubicaciones = data;
      },
      error: (err) => console.error('Error al cargar ubicaciones:', err)
    });
  }

  // Búsqueda de dirección: la geocodificación la hace el backend (/maps/geocode)
  buscarEnMaps(): void {
    const texto = this.busquedaDireccion.trim();
    if (!texto || !this.map) return;

    this.cargandoMaps = true;

    this.ubicacionService.geocodificar(`${texto}, ${CIUDAD_POR_DEFECTO}`).subscribe({
      next: (resultado) => {
        this.cargandoMaps = false;

        if (resultado?.latitud == null || resultado?.longitud == null) {
          alert('No se encontró la dirección en el mapa.');
          return;
        }

        this.resultadoMaps = resultado;

        // Mueve el mapa y el marcador
        const posicion = { lat: resultado.latitud, lng: resultado.longitud };
        this.map.setCenter(posicion);
        this.map.setZoom(16);
        this.marker.position = posicion;
      },
      error: (err) => {
        this.cargandoMaps = false;
        console.error('Error al geocodificar:', err);
        alert('No se encontró la dirección en el mapa.');
      }
    });
  }

  // Guardar (Crear o Actualizar)
  guardarUbicacion(): void {
    if (this.ubicacionEditandoUuid) {
      // Si tenemos un UUID en edición, llamamos al update
      this.ubicacionService.update(this.ubicacionEditandoUuid, this.formData).subscribe({
        next: () => {
          this.resetForm();
          this.cargarUbicaciones();
        },
        error: (err) => console.error('Error al actualizar:', err)
      });
    } else {
      // Si no hay UUID, creamos una ubicación nueva
      this.ubicacionService.crear(this.currentUuidUsuario, this.formData).subscribe({
        next: () => {
          this.resetForm();
          this.cargarUbicaciones();
        },
        error: (err) => console.error('Error al crear:', err)
      });
    }
  }

  // Cargar datos en el formulario para editar
  editar(ub: UbicacionModel): void {
    if (!ub.uuid) return;
    this.ubicacionEditandoUuid = ub.uuid;
    this.formData = { ...ub }; // Copiamos los datos para no modificar la lista directamente
  }

  // Eliminar ubicación
  eliminar(uuid: string): void {
    if (confirm('¿Deseás eliminar esta ubicación?')) {
      this.ubicacionService.delete(uuid).subscribe({
        next: () => this.cargarUbicaciones(),
        error: (err) => console.error('Error al eliminar:', err)
      });
    }
  }

  // Limpiar el formulario y cancelar modo edición
  resetForm(): void {
    this.ubicacionEditandoUuid = null;
    this.formData = {
      calle: '',
      numero: '',
      ciudad: '',
      provincia: '',
      codigoPostal: '',
      piso: '',
      numeroPiso: ''
    };
  }
}