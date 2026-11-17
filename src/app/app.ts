import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Alerta } from './shared/alertas/components/alerta';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Header, Alerta],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('a-quien-llamo');

  private router = inject(Router);

  modoChat = toSignal(
    this.router.events.pipe(
    filter(e => e instanceof NavigationEnd),
    map(() => this.router.url.startsWith('/chats'))
  ),
{
  initialValue: this.router.url.startsWith('/chats')
});
}
