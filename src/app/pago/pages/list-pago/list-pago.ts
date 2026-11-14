
import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { PagoService } from '../../services/pago';
import { PagoResponseModel } from '../../models/pago-response-model';
import { DatePipe } from '@angular/common';

type MetodoListadoPago =
  | 'todos'
  | 'metodoPago'
  | 'estado'
  | 'cliente'
  | 'tecnico';

@Component({
  selector: 'app-list-pago',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './list-pago.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './list-pago.css',
})
export class ListPago implements OnInit {

  @Input() metodo: MetodoListadoPago = 'todos';
  @Input() filtro: string | null = null;

  pagos: PagoResponseModel[] = [];

  cargando = false;
  error = false;

  constructor(
    private pService: PagoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const parametro = this.filtro
      ?? this.route.snapshot.paramMap.get('uuid');

    this.listarPagos(parametro);
  }

  listarPagos(parametro: string | null = null): void {
    this.cargando = true;
    this.error = false;

    let peticion;

    switch (this.metodo) {

      case 'metodoPago':
        if (!parametro) {
          this.error = true;
          this.cargando = false;
          return;
        }

        peticion = this.pService.getByMetodoPago(parametro);
        break;

      case 'estado':
        if (!parametro) {
          this.error = true;
          this.cargando = false;
          return;
        }

        peticion = this.pService.getByEstado(parametro);
        break;

      case 'cliente':
        if (!parametro) {
          this.error = true;
          this.cargando = false;
          return;
        }

        peticion = this.pService.getByCliente(parametro);
        break;

      case 'tecnico':
        if (!parametro) {
          this.error = true;
          this.cargando = false;
          return;
        }

        peticion = this.pService.getByTecnico(parametro);
        break;

      case 'todos':
      default:
        peticion = this.pService.getAll();
        break;
    }

    peticion.subscribe({
      next: (data: PagoResponseModel[]) => {
        this.pagos = data;
        this.cargando = false;
      },

      error: (e) => {
        console.error('Error al obtener los pagos', e);
        this.error = true;
        this.cargando = false;
      }
    });
  }
}
