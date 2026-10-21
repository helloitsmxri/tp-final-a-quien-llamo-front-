import { Component } from '@angular/core';
import { PagoService } from '../../services/pago';
import { ActivatedRoute } from '@angular/router';
import { PagoModel } from '../../models/pago-model';

@Component({
  selector: 'app-list-pago',
  imports: [],
  templateUrl: './list-pago.html',
  styleUrl: './list-pago.css',
})
export class ListPago {

  pagos:PagoModel[]
    constructor(public pService: PagoService, public root:ActivatedRoute){
      this.pagos=[];
    }
  
    ngOnInit(): void {
      this.listarPagos()
    }
  
    listarPagos(){
      this.pService.getAll().subscribe({
        next:(data)=>(this.pagos=data),
        error:(e)=>(console.log(e))
      })
    }
}
