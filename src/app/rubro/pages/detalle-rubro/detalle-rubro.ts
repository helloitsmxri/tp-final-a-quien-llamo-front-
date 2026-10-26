import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { RubroService } from '../../services/rubro';
import { RubroModel } from '../../models/rubro-model';

@Component({
  imports: [],
  selector: 'app-detalle-rubro',
  styleUrl: './detalle-rubro.css',
  templateUrl: './detalle-rubro.html',
})
export class DetalleRubro implements OnInit{
  private servicioRubros = inject(RubroService);
  rubros : RubroModel[] = [];

  @Output() rubroSeleccionado =  new EventEmitter<RubroModel | null>();

  ngOnInit(): void {
    this.servicioRubros.getRubros().subscribe({
      next : (data) => {this.rubros = data},
      error : () => {alert("Error al obtener rubros.")}
    })
  }

  seleccionar (uuid : string){
    this.rubroSeleccionado.emit(this.rubros.find(rubro => rubro.uuidRubro===uuid) ?? null);
  }
}
