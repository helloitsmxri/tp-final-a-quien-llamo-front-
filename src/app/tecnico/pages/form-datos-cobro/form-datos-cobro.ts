
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TecnicoService } from '../../services/tecnico';
import { TecnicoTrabajoRequestModel } from '../../models/Tecnico-trabajo-request.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-form-datos-cobro',
  standalone: true,
  imports: [FormsModule, RouterModule],
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

  errorAlias: string = '';
  errorCvu: string = '';

  guardarDatos(): void {

  this.mensaje = '';
  this.error = '';

  const aliasLimpio = this.alias.trim();
  const cvuLimpio = this.cvu.trim();

  // Validar que se haya ingresado al menos uno
  if (!aliasLimpio && !cvuLimpio) {
    this.error = 'Ingresá un alias, un CVU o ambos.';
    return;
  }

  // Validar longitud del alias
  if (aliasLimpio.length > 100) {
    this.error = 'El alias no puede superar los 100 caracteres.';
    return;
  }

  if (aliasLimpio && !/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(aliasLimpio)) {
  this.error = 'El alias debe contener al menos una letra.';
  return;
}

if (aliasLimpio.length > 100) {
  this.error = 'El alias no puede superar los 100 caracteres.';
  return;
}

  // Validar que el CVU tenga exactamente 22 números
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
    this.errorCvu = 'El CVU debe contener exactamente 22 números.';
  }
}
}
