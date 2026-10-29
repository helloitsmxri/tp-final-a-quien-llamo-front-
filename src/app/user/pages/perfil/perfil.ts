import { Component, inject, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/user';
import { UserProfileDTO } from '../../models/user-profile-DTO';
import { RatingModel } from '../../../rating/models/rating-model';

@Component({
  selector: 'app-perfil',
  imports: [],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil {
  private usuarioService = inject(UsuarioService);

  perfil : UserProfileDTO | null = null;
  fotoSrc : string | null = null;
  iniciales : string = '';
  promedio : number = 0;
  resenas : RatingModel[] = [];
  cargando : boolean = true;

  ngOnInit () : void {
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.usuarioService.getMyProfile().subscribe({
      next : (perfilUsuario) => {
        this.perfil = perfilUsuario;
        this.fotoSrc = perfilUsuario.foto;
        this.iniciales = this.obtenerIniciales(perfilUsuario.nombre, perfilUsuario.apellido);
        this.cargando = false;
      },
      error : () => {
        this.cargando = false;
        alert('No se pudo cargar la información del perfil.');
      }
    })
  }

  obtenerIniciales(nombre: string, apellido: string): string {
    const n = nombre ? nombre.charAt(0) : '';
    const a = apellido ? apellido.charAt(0) : '';
    return (n + a).toUpperCase();
  }

  estrellas(valor: number): string {
    return '⭐'.repeat(Math.round(valor));
  }
}
