import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UbicacionModel } from '../../models/ubicacion-model';
import { GoogleMapsModel } from '../../models/GoogleMapsModel';
import { UbicacionService } from '../../services/ubicacion-service';
import * as L from 'leaflet';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-detalle-ubicacion',
  styleUrl: './detalle-ubicacion.css',
  templateUrl: './detalle-ubicacion.html',
})
export class DetalleUbicacion implements OnInit, AfterViewInit{

  currentUuidUsuario: string = '729c5bdf-7f18-4beb-926e-1e808951c220';

  // 1. Lista de ubicaciones guardadas
  ubicaciones: UbicacionModel[] = [];

  // 2. Variables para la búsqueda en Google Maps
  busquedaDireccion: string = '';
  resultadoMaps: GoogleMapsModel | null = null;
  cargandoMaps: boolean = false;

  // 3. Formulario. tengo que verificar si se hizo reactivo
  formData: UbicacionModel = {
    calle: '',
    numero: '',
    ciudad: '',
    provincia: '',
    codigoPostal: '',
    piso: '',
    numeroPiso: ''
  };

  // Variable para saber si estamos editando una ubicación existente o creando una nueva
  ubicacionEditandoUuid: string | null = null;

  private map!: L.Map;
  private marker!: L.Marker;

  constructor(private ubicacionService: UbicacionService) {}

  ngOnInit(): void {
    this.cargarUbicaciones();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  /* Inicializamos el mapa centrado por defento en Argentina, probar si anda bien */
  private initMap(): void {
    this.map = L.map('mapa-container').setView([-38.0055, -57.5426], 13); // coordenadas por defecto para probar. ej: Mar del Plata

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    // Ajusta un ícono por defecto
    const customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    this.marker = L.marker([-38.0055, -57.5426], { icon: customIcon }).addTo(this.map);
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

// Búsqueda con OpenStreetMap (Nominatim) - Opción gratuita y sin APIKey)
  buscarEnMaps(): void {
    if (!this.busquedaDireccion.trim()) return;

    this.cargandoMaps = true;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.busquedaDireccion)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        this.cargandoMaps = false;
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);

          this.resultadoMaps = {
            direccionFormateada: data[0].display_name,
            latitud: lat,
            longitud: lon
          };

          // Mueve el mapa y el marcador de Leaflet
          if (this.map && this.marker) {
            this.map.setView([lat, lon], 16);
            this.marker.setLatLng([lat, lon]);
          }
        } else {
          alert('No se encontró la dirección en el mapa.');
        }
      })
      .catch(err => {
        this.cargandoMaps = false;
        console.error('Error al geocodificar:', err);
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
