import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PagoService } from '../../services/pago';
import { PagoResponseModel } from '../../models/pago-response-model';
import { EstadoPago } from '../../enum/estado-pago';

@Component({
  selector: 'app-detalle-pago',
  standalone: true,
  imports: [DatePipe, RouterModule],
  templateUrl: './detalle-pago.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './detalle-pago.css',
})
export class DetallePago implements OnInit {
  private route = inject(ActivatedRoute);
  private pagoService = inject(PagoService);
  private cdr = inject(ChangeDetectorRef);

  @Input() metodo: 'uuid' | 'mercadoPagoOrderId' = 'uuid';
  @Input() identificador: string | null = null;

  pago: PagoResponseModel | null = null;
  cargando = true;
  error = false;

  ngOnInit(): void {
    const id = this.identificador
      ?? this.route.snapshot.paramMap.get(
        this.metodo === 'mercadoPagoOrderId' ? 'mercadoPagoOrderId' : 'uuid'
      );

    if (!id?.trim()) {
      this.error = true;
      this.cargando = false;
      return;
    }

    this.detallePago(id);
  }

  detallePago(id: string): void {
    this.cargando = true;
    this.error = false;
    this.pago = null;

    const peticion = this.metodo === 'mercadoPagoOrderId'
      ? this.pagoService.getByMercadoPagoOrderId(id)
      : this.pagoService.getByUuid(id);

    peticion.subscribe({
      next: (data: PagoResponseModel) => {
        this.pago = data;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al obtener detalle del pago:', err);
        this.error = true;
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  formatearEstado(estado: EstadoPago | string): string {
    return String(estado).replaceAll('_', ' ');
  }

 esPendienteDeRevision(estado: EstadoPago | string): boolean {
    const normalizado = String(estado)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replaceAll('_', ' ')
      .trim();

    return normalizado === 'pendiente de revision';
  }

  esMercadoPago(pago: PagoResponseModel): boolean {
    return !pago.proveedorDePago || String(pago.proveedorDePago) === 'MERCADO_PAGO';
  }

  obtenerUrlMercadoPago(pago: PagoResponseModel): string {
    return pago.checkoutUrl?.trim() || 'https://www.mercadopago.com.ar/';
  }
}