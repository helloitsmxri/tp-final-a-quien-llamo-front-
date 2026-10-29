import { Component, OnInit } from '@angular/core';
import { TrabajoService } from '../../services/trabajo';
import { ActivatedRoute } from '@angular/router';
import { TrabajoModel } from '../../models/trabajo-model';

@Component({
  selector: 'app-list-trabajo',
  imports: [],
  templateUrl: './list-trabajo.html',
  styleUrl: './list-trabajo.css',
})
export class ListTrabajo  implements OnInit{

  trabajos:TrabajoModel[]
  constructor(public tService: TrabajoService, public root:ActivatedRoute){
    this.trabajos=[];
  }

  ngOnInit(): void {
    this.listarTrabajos()
  }

  listarTrabajos(){
    this.tService.getAll().subscribe({
      next:(data)=>(this.trabajos=data),
      error:(e)=>(console.log(e))
    })
  }
}
