import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
especialidad = '';
  ciudad = '';
 
  buscar(): void {
    const especialidad = this.especialidad.trim();
    const ciudad = this.ciudad.trim();
 
    if (!especialidad && !ciudad) {
      return; // no buscar si está todo vacío
    }
 
    // TODO: acá tenemos q ver de llamar al servicio
    // this.router.navigate(['/resultados'], { queryParams: { especialidad, ciudad } });
    console.log({ especialidad, ciudad });
  }
}
