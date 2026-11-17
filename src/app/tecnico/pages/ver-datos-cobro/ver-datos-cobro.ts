
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TecnicoService } from '../../services/tecnico';
import { TecnicoTrabajoRequestModel } from '../../models/Tecnico-trabajo-request.model';

@Component({
  selector: 'app-ver-datos-cobro',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './ver-datos-cobro.html',
  styleUrl: './ver-datos-cobro.css'
})
export class VerDatosCobro implements OnInit {

  private tecnicoService = inject(TecnicoService);

  alias: string = '';
  cvu: string = '';

  cargando: boolean = true;
  guardando: boolean = false;

  mensaje: string = '';
  error: string = '';

  private cdr = inject(ChangeDetectorRef);

 
  ngOnInit(): void {
  console.log('Se inició VerDatosCobro');
  this.cargarDatos();
}

cargarDatos(): void {
  console.log('Se está llamando a obtenerDatosCobro');

  this.cargando = true;
  this.error = '';

  this.tecnicoService.obtenerDatosCobro().subscribe({
    next: (datos) => {
  console.log('Datos recibidos:', datos);

  this.alias = datos.alias ?? '';
  this.cvu = datos.cvu ?? '';
  this.cargando = false;

  console.log('Estado de cargando:', this.cargando);
  console.log('Alias asignado:', this.alias);
  this.cdr.detectChanges();
},
    error: (err) => {
      console.error('Error al obtener los datos de cobro:', err);
      this.error = 'No se pudieron cargar tus datos de cobro.';
      this.cargando = false;
    }
  });
}

  guardarCambios(): void {
    this.mensaje = '';
    this.error = '';

    const aliasLimpio = this.alias.trim();
    const cvuLimpio = this.cvu.trim();

    if (!aliasLimpio && !cvuLimpio) {
      this.error = 'Tenés que conservar al menos un dato de cobro.';
      return;
    }

    if (cvuLimpio && !/^\d{22}$/.test(cvuLimpio)) {
      this.error = 'El CVU debe tener exactamente 22 números.';
      return;
    }

    const datos: TecnicoTrabajoRequestModel = {
      alias: aliasLimpio || null,
      cvu: cvuLimpio || null
    };

    this.guardando = true;

    this.tecnicoService.actualizarDatosCobro(datos).subscribe({
      next: () => {
        this.alias = aliasLimpio;
        this.cvu = cvuLimpio;
        this.mensaje = '¡Tus datos de cobro se actualizaron correctamente!';
        this.guardando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al actualizar los datos:', err);
        this.error = 'No se pudieron actualizar los datos. Intentá nuevamente.';
        this.guardando = false;
      }
    });
  }

  borrarAlias(): void {
    this.alias = '';
    this.mensaje = '';
    this.error = '';
  }

  borrarCvu(): void {
    this.cvu = '';
    this.mensaje = '';
    this.error = '';
  }
}
