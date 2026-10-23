import { Component } from '@angular/core';
import {RouterOutlet } from '@angular/router';
import { Plan } from './models/Plan';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planes',
  imports: [RouterOutlet],
  templateUrl: './planes.html',
  styleUrl: './planes.css',
})
export class Planes {
  planes : Plan[]=[
    {id: 'usuario',
      titulo: 'Plan Usuario',
      descripcion: 'Para quienes estén buscando soluciones.',
      beneficios: ['Acceso ilimitado', 'Dejar reseñas de perfiles', 'Contratar profesinales'],
      imagen: '/planes/planes1.png',
      boton: 'Elegir plan usuario',
      invertido: false,
      ruta: '/register'
    },
    {id: 'duo',
      titulo: 'Plan dúo',
      descripcion: 'Para quienes estén buscando soluciones y además, las provean.',
      beneficios: ['Cargar proyectos, trabajos, certificados', 'Todo en uno', 'Generar presupuestos ilimitados'],
      imagen: '/planes/planes2.png',
      boton: 'Elegir plan dúo',
      invertido: true,
      ruta: '/register'
    }
  ]
  
  constructor(private router: Router) {}

  elegirPlan(plan: Plan): void{
    this.router.navigate([plan.ruta]);
  }


}
