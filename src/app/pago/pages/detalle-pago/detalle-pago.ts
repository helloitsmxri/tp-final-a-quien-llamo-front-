
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PagoService } from '../../services/pago';
import { PagoModel } from '../../models/pago-model';

type MetodoDetallePago =
  | 'uuid'
  | 'mercadoPagoOrderId';

@Component({
  selector: 'app-detalle-pago',
  standalone: true,
  imports: [],
  templateUrl: './detalle-pago.html',
  styleUrl: './detalle-pago.css',
})
export class DetallePago implements OnInit {

  @Input() metodo: MetodoDetallePago = 'uuid';
  @Input() identificador: string | null = null;

  pago: PagoModel | undefined;
  cargando = false;
  error = false;

  constructor(
    private pService: PagoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.identificador
      ?? this.route.snapshot.paramMap.get('uuid');

    if (!id) {
      this.error = true;
      return;
    }

    this.detallePago(id);
  }

  detallePago(id: string): void {
    this.cargando = true;
    this.error = false;

    const peticion = this.metodo === 'mercadoPagoOrderId'
      ? this.pService.getByMercadoPagoOrderId(id)
      : this.pService.getByUuid(id);

    peticion.subscribe({
      next: (data: PagoModel) => {
        this.pago = data;
        this.cargando = false;
      },
      error: (e) => {
        console.error('Error al obtener el pago', e);
        this.error = true;
        this.cargando = false;
      }
    });
  }
}
