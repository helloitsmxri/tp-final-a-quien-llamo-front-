
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TecnicoService } from '../../services/tecnico';
import { TecnicoTrabajoRequestModel } from '../../models/Tecnico-trabajo-request.model';

@Component({
  selector: 'app-form-datos-cobro',
  standalone: true,
  imports: [FormsModule],
  styleUrl: './form-datos-cobro.css',
  templateUrl: './form-datos-cobro.html',
})
export class FormDatosCobro {

  private tecnicoService = inject(TecnicoService);
  private cdr = inject(ChangeDetectorRef);

  alias: string = '';
  cvu: string = '';

  cargando: boolean = false;
  mensaje: string = '';
  error: string = '';
guardarDatos(): void {

  this.mensaje = '';
  this.error = '';

  const aliasLimpio = this.alias.trim();
  const cvuLimpio = this.cvu.trim();

  if (!aliasLimpio && !cvuLimpio) {
    this.error = 'Ingresá un alias, un CVU o ambos.';
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

  this.cargando = true;

  this.tecnicoService.actualizarDatosCobro(datos).subscribe({
    next: () => {
      this.mensaje = '¡Tus datos de cobro se cargaron correctamente!';
      this.error = '';
      this.cargando = false;

      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error al guardar los datos de cobro:', err);
      this.error = 'No se pudieron guardar los datos. Intentá nuevamente.';
      this.cargando = false;

      this.cdr.detectChanges();
    }
  });
}
}
