import { Component, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth-service';

@Component({
  imports: [],
  selector: 'app-header-izquierdo',
  styleUrl: './header-izquierdo.css',
  templateUrl: './header-izquierdo.html',
})
export class HeaderIzquierdo {
  authService = inject(AuthService)

  // acá van los íconos de cada cosita del menú
  items = [
    {ruta : '/', etiqueta: 'Inicio', icono: ''},
    { ruta: '/chats', etiqueta: 'Mis mensajes', icono: '' },
    { ruta: '/mis-trabajos', etiqueta: 'Mis trabajos', icono: '' },
    { ruta: '/mis-presupuestos', etiqueta: 'Mis presupuestos', icono: '' },
    { ruta: '/mis-resenas', etiqueta: 'Mis reseñas', icono: '' },
    { ruta: '/mis-denuncias', etiqueta: 'Mis denuncias', icono: '' },
  ]
}
