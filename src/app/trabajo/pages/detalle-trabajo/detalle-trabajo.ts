import { Component, OnInit } from '@angular/core';
import { TrabajoService } from '../../services/trabajo';
import { ActivatedRoute } from '@angular/router';
import { TrabajoModel } from '../../models/trabajo-model';

@Component({
  imports: [],
  selector: 'app-detalle-trabajo',
  styleUrl: './detalle-trabajo.css',
  templateUrl: './detalle-trabajo.html',
})
export class DetalleTrabajo implements OnInit {
  trabajo:TrabajoModel | undefined
  constructor(public tService:TrabajoService, public route:ActivatedRoute){}

  ngOnInit(): void {  
    const uuid = this.route.snapshot.paramMap.get('uuid');
    this.detalleTrabajo(uuid)
  }

  detalleTrabajo(uuid : string|null){
    this.tService.getByUuid(uuid).subscribe({
      next:(data)=>(this.trabajo=data),
      error:(e)=>(console.log(e))
    })
  }
}
