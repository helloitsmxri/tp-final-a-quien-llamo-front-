import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UbicacionModel } from '../../models/ubicacion-model';
import { GoogleMapsModel } from '../../models/GoogleMapsModel';
import { UbicacionService } from '../../services/ubicacion-service';

@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-detalle-ubicacion',
  styleUrl: './detalle-ubicacion.css',
  templateUrl: './detalle-ubicacion.html',
})
export class DetalleUbicacion implements OnInit{

  currentUuidUsuario: string = '550e8400-e29b-41d4-a716-446655440000';

  // 1. Lista de ubicaciones guardadas
  ubicaciones: UbicacionModel[] = [];

  // 2. Variables para la búsqueda en Google Maps
  busquedaDireccion: string = '';
  resultadoMaps: GoogleMapsModel | null = null;
  cargandoMaps: boolean = false;

  // 3. Formulario (objeto que se enlaza con los inputs del HTML)
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

  constructor(private ubicacionService: UbicacionService) {}

  ngOnInit(): void {
    this.cargarUbicaciones();
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

  // Buscar coordenadas/dirección formateada con la API de Google Maps
  buscarEnMaps(): void {
    if (!this.busquedaDireccion.trim()) return;

    this.cargandoMaps = true;
    this.ubicacionService.geocodificar(this.busquedaDireccion).subscribe({
      next: (res) => {
        this.resultadoMaps = res;
        this.cargandoMaps = false;
      },
      error: (err) => {
        console.error('Error en Google Maps:', err);
        this.cargandoMaps = false;
        alert('No se encontró la dirección especificada.');
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
