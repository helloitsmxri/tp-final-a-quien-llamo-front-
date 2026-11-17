import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../auth/services/auth-service';
import { UsuarioService } from '../../user/services/user';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header-izquierdo',
  styleUrl: './header-izquierdo.css',
  templateUrl: './header-izquierdo.html',
})
export class HeaderIzquierdo implements OnInit{
  authService = inject(AuthService)
  private usuarioService = inject(UsuarioService);

  foto = signal<string | null>(null);

  // acá van los íconos de cada cosita del menú
  items = [
    {ruta : '/', etiqueta: 'Inicio', icono: 'íconos/iconos-header-lateral/home-page.png'},
    { ruta: '/chats', etiqueta: 'Mis mensajes', icono: '/íconos/iconos-header-lateral/speech-bubble-icon.png' },
    { ruta: '/mis-trabajos', etiqueta: 'Mis trabajos', icono: '/íconos/iconos-header-lateral/mis-trabajos.png' },
    { ruta: '/mis-presupuestos', etiqueta: 'Mis presupuestos', icono: '/íconos/iconos-header-lateral/mis-presupuestos.png' },
    { ruta: '/mis-resenas', etiqueta: 'Mis reseñas', icono: 'íconos/iconos-header-lateral/resenas.png' },
    { ruta: '/mis-denuncias', etiqueta: 'Mis denuncias', icono: 'íconos/iconos-header-lateral/denuncias.png' },
  ]

    ngOnInit(): void {
    this.usuarioService.getMyProfile().subscribe({
      next: (u) => {
        const f = u.fotoBase64;
        if (!f) {
          this.foto.set(null);
        } else if (f.startsWith('data:')) {
          this.foto.set(f);   // ya viene como data URL
        } else {
          this.foto.set(`data:${u.tipoImagen ?? 'image/jpeg'};base64,${f}`);
        }
      },
      error: () => this.foto.set(null)   // si falla, queda el ícono de persona
    });
  }
}
