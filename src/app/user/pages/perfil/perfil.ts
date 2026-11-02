import { Component, inject, OnInit } from '@angular/core';
import { UsuarioService } from '../../services/user';
import { UserProfileDTO } from '../../models/user-profile-DTO';
import { RatingResponse } from '../../../rating/models/rating-response';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil',
  imports: [RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})

export class Perfil implements OnInit{
  private usuarioService = inject(UsuarioService);
  private route = inject(ActivatedRoute);

  perfil : UserProfileDTO | null = null;

  fotoSrc : string | null = null;
  iniciales : string = '';

  promedio : number = 0;
  imagenEstrellas : string | null = null;

  resenas : RatingResponse[] = [];
  cargando : boolean = true;


  // esto es pa q funcione el get de un perfil ajeno
  esMiPerfil = false;

  // esto es para el rating:
  // la otra opción sería armar un array q ya lo hcie en otros forms
  // pero bueno esta me parece la + prolijita
  private imagenesEstrellas: { [key: number]: string } = {
    0.5: 'media-estrella',
    1: 'una-estrella',
    1.5: 'una-estrella-y-media',
    2: 'dos-estrellas',
    2.5: 'dos-estrellas-y-media',
    3: 'tres-estrellas',
    3.5: 'tres-estrellas-y-media',
    4: 'cuatro-estrellas',
    4.5: 'cuatro-estrellas-y-media',
    5: 'cinco-estrellas'
};

  ngOnInit () : void {
    this.route.paramMap.subscribe(() => {
      this.cargarPerfil();
    })
  }

  cargarPerfil() {
    this.cargando = true;

    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid){
      this.esMiPerfil = false;

      this.usuarioService.getProfile(uuid).subscribe({
        next : (perfil) => { this.procesarPerfil(perfil)},
        error : () => {
          this.cargando = false;
          alert('No se pudo cargar este perfil.')
        }
      })

      return;
    }

    this.esMiPerfil = true;

    this.usuarioService.getMyProfile().subscribe({
      next : (perfil) => {this.procesarPerfil(perfil)},
      error : () => {
        this.cargando = false;
        alert('No se pudo cargar la información del perfil.');
      }
    })
  }

  private procesarPerfil( perfil : UserProfileDTO){
    this.perfil = perfil;

    this.fotoSrc = this.armarFoto(perfil.foto, perfil.tipoImagen);
    this.iniciales = this.obtenerIniciales(perfil.nombre, perfil.apellido);
    this.resenas = perfil.calificacionesRecibidas ?? [];
    this.promedio = perfil.promedioCalificaciones ?? this.calcularPromedio();
    this.imagenEstrellas = this.resenas.length > 0 ? this.obtenerImagenEstrellas(this.promedio) : null;
    this.cargando = false;
  }

  armarFoto(foto: string | null | undefined, tipo: string | null | undefined): string | null {
    if (!foto) return null;
    if (foto.startsWith('data:')) return foto;
    return tipo && tipo !== 'None' ? `data:${tipo};base64,${foto}` : null;
  } // esta sirve porq acepta la imagen ya lista tipo "data:image/png" o la base64 + el tipo

   fotoResena(r: RatingResponse): string | null {
    return this.armarFoto(r.foto, r.tipoFoto);
  }

  obtenerIniciales(nombre: string, apellido: string): string {
    const n = nombre ? nombre.charAt(0) : '';
    const a = apellido ? apellido.charAt(0) : '';
    return (n + a).toUpperCase();
  }

  calcularPromedio(): number {
    if (this.resenas.length === 0) return 0;
    return this.resenas.reduce((total, r) => total + r.valoracion, 0) / this.resenas.length;
  }
 
  get promedioTexto(): string {
    return this.promedio.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  // borro el anterior m étodo porq no sirve mas xq agregué mis ilustraciones d estrella
  // redondea al 0,5 más cercano (Math.round((v * 2) / 2) redondeaba a entero)
  obtenerImagenEstrellas(valor: number): string {
    const aMedios = Math.round(valor * 2) / 2;
    const redondeado = Math.min(5, Math.max(0.5, aMedios));
    return `/ilustraciones/rating/${this.imagenesEstrellas[redondeado]}.png`;
  }
}
