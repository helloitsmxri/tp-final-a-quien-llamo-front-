import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
// ElementRef = me deja agarrar el elemento HTML de este componente (lo uso para saber si hicieron clic afuera)
  private el = inject(ElementRef);
  // Router = lo uso para enterarme cuando la persona cambia de página
  private router = inject(Router);
 
  // signal = una variablecita q Angular vigila: cuando cambia, actualiza la pantalla sola.
  // false = panel cerrado, true = abierto
  abierto = signal(false);
  // true cuando la URL empieza con /categorias (o sea, estoy en alguna categoría)
  enCategorias = signal(false);

  // acá me guardo con qué tocó por última vez la persona: 'mouse', 'touch' (dedo) o 'pen'.
  // sirve xq con mouse el panel se abre al pasar, pero con el dedo se abre tocando
  private ultimoPuntero = 'mouse';
 
  // OJO: "ruta" también es el nombre del área en la grilla del CSS. Si cambio uno, tengo q cambiar el otro
  // TODO: cambiar las rutas de imagen por mis dibujos (mejor en .webp q pesan menos)
  categorias = [
    { nombre: 'Hogar',        ruta: 'hogar',        imagen: '/iconos/categorias/hogar.webp' },
    { nombre: 'Construcción', ruta: 'construccion', imagen: '/iconos/categorias/construccion.webp' },
    { nombre: 'Tecnología',   ruta: 'tecnologia',   imagen: '/iconos/categorias/tecnologia.webp' },
    { nombre: 'Diseño',       ruta: 'diseno',       imagen: '/iconos/categorias/diseno.webp' },
    { nombre: 'Transporte',   ruta: 'transporte',   imagen: '/iconos/categorias/transporte.webp' },
    { nombre: 'Educación',    ruta: 'educacion',    imagen: '/iconos/categorias/educacion.webp' },
    { nombre: 'Mascotas',     ruta: 'mascotas',     imagen: '/iconos/categorias/mascotas.webp' },
    { nombre: 'Eventos',      ruta: 'eventos',      imagen: '/iconos/categorias/eventos.webp' },
  ];
 
  constructor() {
    // por si entran directo a una URL de categoría (ej. recargando la página)
    this.enCategorias.set(this.router.url.startsWith('/categorias'));

    // esto escucha los cambios de página. Cuando termina de navegar (NavigationEnd) cierra el panel,
    // así no hace falta ponerle un cerrar() a cada tarjeta.
    // takeUntilDestroyed hace q deje de escuchar cuando el componente se destruye (para no dejar cosas colgadas)
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.cerrar());

      // cada vez q cambia la página, vuelvo a chequear si estoy en categorías
      this.enCategorias.set(this.router.url.startsWith('/categorias'));
  }
 
  // abren y cierran el panel cambiando el signal
  abrir()  { 
    this.abierto.set(true); 
  }
  cerrar() { 
    this.abierto.set(false); 
  }
 
  // se ejecuta cuando el puntero entra a "Categorías".
  // me guardo con qué entró, y SOLO si es mouse abro el panel (el dedo no abre acá, abre con el toque)
  entrar(e: PointerEvent) {
    this.ultimoPuntero = e.pointerType;
    if (e.pointerType === 'mouse') this.abrir();
  }
 
  // se ejecuta cuando hacen clic en el botón "Categorías".
  // con mouse: ya está abierto por el hover, así q solo me aseguro de q siga abierto (si alternara, lo cerraría y sería raro).
  // con dedo o teclado: alterna, o sea si estaba abierto lo cierra y si estaba cerrado lo abre
  clic() {
    if (this.ultimoPuntero === 'mouse') this.abrir();
    else this.abierto.update((v) => !v);
  }
 
  // se ejecuta cuando el mouse sale de TODO el header (barra + panel). Solo cierra si es mouse,
  // xq en el celu no existe "salir" y se cerraría solo
  salirDelHeader(e: MouseEvent) {
    if (this.ultimoPuntero === 'mouse') this.cerrar();
  }
 
  // @HostListener escucha eventos de toda la página, no solo de este componente.
  // este: si hacen clic o tocan en cualquier lado q NO sea el header, se cierra
  @HostListener('document:click', ['$event'])
  clickFuera(e: MouseEvent) {
    if (!this.el.nativeElement.contains(e.target)) this.cerrar();
  }
 
  // si aprietan Escape, se cierra (se espera eso de cualquier menú desplegable)
  @HostListener('document:keydown.escape')
  escape() { 
    this.cerrar(); 
  }
}
