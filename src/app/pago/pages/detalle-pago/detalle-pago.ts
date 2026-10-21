import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PagoService } from '../../services/pago';
import { PagoModel } from '../../models/pago-model';

@Component({
  imports: [],
  selector: 'app-detalle-pago',
  styleUrl: './detalle-pago.css',
  templateUrl: './detalle-pago.html',
})
export class DetallePago {
    pago:PagoModel | undefined
  constructor(public pService:PagoService, public route:ActivatedRoute){}

  ngOnInit(): void {  
    const uuid = this.route.snapshot.paramMap.get('uuid');
    this.detallePago(uuid)
  }

  detallePago(uuid : string|null){
    this.pService.getByUuid(uuid).subscribe({
      next:(data)=>(this.pago=data),
      error:(e)=>(console.log(e))
    })
  }
}
