
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
  private cdr = inject(ChangeDetectorRef);

  alias: string = '';
  cvu: string = '';

  cargando: boolean = true;
  guardando: boolean = false;

  mensaje: string = '';
  error: string = '';

  errorAlias: string = '';
  errorCvu: string = '';

  ngOnInit(): void {
    console.log('Se inició VerDatosCobro');
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = '';

    this.tecnicoService.obtenerDatosCobro().subscribe({
      next: (datos) => {
        this.alias = datos.alias ?? '';
        this.cvu = datos.cvu ?? '';
        this.cargando = false;

        this.validarAlias();
        this.validarCvu();

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener los datos de cobro:', err);
        this.error = 'No se pudieron cargar tus datos de cobro.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  validarAlias(): void {
    const valor = this.alias.trim();

    this.errorAlias = '';

    if (valor.length > 100) {
      this.errorAlias = 'El alias no puede superar los 100 caracteres.';
    } else if (valor && !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(valor)) {
      this.errorAlias = 'El alias debe contener al menos una letra.';
    }
  }

  validarCvu(): void {
    const valor = this.cvu.trim();

    this.errorCvu = '';

    if (valor && !/^\d{22}$/.test(valor)) {
      this.errorCvu = 'El CVU debe tener exactamente 22 números.';
    }
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

    if (aliasLimpio.length > 100) {
      this.errorAlias = 'El alias no puede superar los 100 caracteres.';
      return;
    }

    if (aliasLimpio && !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(aliasLimpio)) {
      this.errorAlias = 'El alias debe contener al menos una letra.';
      return;
    }

    if (cvuLimpio && !/^\d{22}$/.test(cvuLimpio)) {
      this.errorCvu = 'El CVU debe tener exactamente 22 números.';
      return;
    }

    this.errorAlias = '';
    this.errorCvu = '';

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
        this.cdr.detectChanges();
      }
    });
  }

  borrarAlias(): void {
    this.alias = '';
    this.errorAlias = '';
    this.mensaje = '';
    this.error = '';
  }

  borrarCvu(): void {
    this.cvu = '';
    this.errorCvu = '';
    this.mensaje = '';
    this.error = '';
  }
}
