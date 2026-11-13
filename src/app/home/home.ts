import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  mostrarError = this.route.snapshot.queryParamMap.get('error') === 'not-found';

  especialidad = '';
  ciudad = '';

  buscar(): void {
    const especialidad = this.especialidad.trim();
    const ciudad = this.ciudad.trim();

    if (especialidad) {
      this.router.navigate(['/tecnicos'], {
        queryParams: { especialidad }
      });
      return;
    }

    if (ciudad) {
      this.router.navigate(['/ubicacion'], {
        queryParams: { busqueda: ciudad }
      });
    }
  }
}