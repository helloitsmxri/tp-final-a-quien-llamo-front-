import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';

import { PagoService } from '../../services/pago';
import { PagoResponseModel } from '../../models/pago-response-model';
import { MetodoDePago } from '../../enum/metodo-de-pago';
import { EstadoPago } from '../../enum/estado-pago';
import { UsuarioService } from '../../../user/services/user';

type MetodoListadoPago =
  | 'mis-pagos'
  | 'todos'
  | 'metodoPago'
  | 'estado'
  | 'cliente'
  | 'tecnico';

@Component({
  selector: 'app-list-pago',
  standalone: true,
  imports: [DatePipe, RouterModule],
  templateUrl: './list-pago.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './list-pago.css',
})
export class ListPago implements OnInit {

  private usuarioService = inject(UsuarioService);
  private cdr = inject(ChangeDetectorRef);

  @Input() metodo: MetodoListadoPago = 'mis-pagos';
  @Input() filtro: string | null = null;

  pagos: PagoResponseModel[] = [];

  cargando = false;
  error = false;
  cancelandoUuid: string | null = null;

  constructor(
    private pService: PagoService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const parametro = this.filtro ?? this.route.snapshot.paramMap.get('uuid');
    this.listarPagos(parametro);
  }

  listarPagos(parametro: string | null = null): void {
    this.cargando = true;
    this.error = false;

    if (this.metodo === 'mis-pagos' && !parametro) {
      this.usuarioService.getMyProfile().subscribe({
        next: (perfil) => {
          this.ejecutarConsulta(this.pService.getByCliente(perfil.uuid));
        },
        error: (e) => {
          console.error('Error al obtener perfil:', e);
          this.error = true;
          this.cargando = false;
          this.cdr.markForCheck();
        }
      });
      return;
    }

    let peticion: Observable<PagoResponseModel[]>;

    switch (this.metodo) {
      case 'metodoPago':
        if (!parametro?.trim() || !Object.values(MetodoDePago).includes(parametro as MetodoDePago)) {
          this.marcarError();
          return;
        }
        peticion = this.pService.getByMetodoPago(parametro as MetodoDePago);
        break;

      case 'estado':
        if (!parametro?.trim() || !Object.values(EstadoPago).includes(parametro as EstadoPago)) {
          this.marcarError();
          return;
        }
        peticion = this.pService.getByEstado(parametro as EstadoPago);
        break;

      case 'cliente':
        if (!parametro?.trim()) {
          this.marcarError();
          return;
        }
        peticion = this.pService.getByCliente(parametro);
        break;

      case 'tecnico':
        if (!parametro?.trim()) {
          this.marcarError();
          return;
        }
        peticion = this.pService.getByTecnico(parametro);
        break;

      case 'todos':
      default:
        peticion = this.pService.getAll();
        break;
    }

    this.ejecutarConsulta(peticion);
  }

  private ejecutarConsulta(peticion: Observable<PagoResponseModel[]>): void {
    peticion.subscribe({
      next: (data: PagoResponseModel[]) => {
        this.pagos = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (e) => {
        console.error('Error al obtener los pagos', e);
        this.marcarError();
      }
    });
  }

  private marcarError(): void {
    this.error = true;
    this.cargando = false;
    this.cdr.markForCheck();
  }

  formatearEstado(estado: EstadoPago | string): string {
    return String(estado).replaceAll('_', ' ');
  }

  esPendienteDeRevision(estado: EstadoPago): boolean {
    return String(estado) === 'Pendiente_de_revision';
  }

  cancelarPago(pago: PagoResponseModel): void {
    if (!confirm('¿Seguro que querés cancelar este intento de pago?')) return;

    this.cancelandoUuid = pago.uuid;
    this.pService.cancelarPago(pago.uuid).subscribe({
      next: (actualizado) => {
        const idx = this.pagos.findIndex(p => p.uuid === pago.uuid);
        if (idx !== -1) this.pagos[idx] = actualizado;
        this.cancelandoUuid = null;
        this.cdr.markForCheck();
      },
      error: (e) => {
        console.error('Error al cancelar pago:', e);
        this.cancelandoUuid = null;
        this.cdr.markForCheck();
      }
    });
  }
}