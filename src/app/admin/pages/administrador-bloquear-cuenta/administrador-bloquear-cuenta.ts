
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../services/admin-service';

@Component({
  selector: 'app-administrador-bloquear-cuenta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './administrador-bloquear-cuenta.html',
  styleUrl: './administrador-bloquear-cuenta.css',
})
export class AdministradorBloquearCuenta {

  uuidControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required]
  });

  procesando = false;

  constructor(
    private adminService: AdminService
  ) {}

  bloquearCuenta(): void {

    const uuid = this.uuidControl.value.trim();

    if (!uuid) {
      alert('Ingresá el UUID del usuario.');
      return;
    }

    const confirmar = confirm(
      `¿Estás seguro de que querés dar de baja la cuenta del usuario con UUID ${uuid}?`
    );

    if (!confirmar) {
      return;
    }

    this.procesando = true;

    this.adminService.bajaUsuario(uuid).subscribe({

      next: () => {
        this.procesando = false;

        alert('La cuenta del usuario fue dada de baja correctamente.');

        this.uuidControl.reset('');
      },

      error: (error) => {
        this.procesando = false;

        console.error('Error al bloquear la cuenta:', error);

        alert('No se pudo bloquear la cuenta. Verificá el UUID e intentá nuevamente.');
      }

    });
  }

  limpiarFormulario(): void {
    this.uuidControl.reset('');
  }
}
