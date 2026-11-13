
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { PagoRequestModel } from '../models/pago-request-model';
import { PagoResponseModel } from '../models/pago-response-model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {

    private readonly API_URL = 'http://localhost:8080/aquienllamo/pagos';

    private readonly API_URL_METODOPAGO = `${this.API_URL}/metodoPago`;
    private readonly API_URL_ESTADO = `${this.API_URL}/estado`;
    private readonly API_URL_PAGOSCLIENTE = `${this.API_URL}/cliente`;
    private readonly API_URL_PAGOSTECNICO = `${this.API_URL}/tecnico`;
    private readonly API_URL_MP_ORDEN = `${this.API_URL}/mercado-pago/orden`;

    constructor(private http: HttpClient) {}

    // CREATE: crear un pago
    store(pago: PagoRequestModel): Observable<PagoResponseModel> {
        return this.http.post<PagoResponseModel>(this.API_URL, pago);
    }

    // READ: obtener todos los pagos
    getAll(): Observable<PagoResponseModel[]> {
        return this.http.get<PagoResponseModel[]>(this.API_URL);
    }

    // READ: obtener un pago por UUID
    getByUuid(uuid: string): Observable<PagoResponseModel> {
        return this.http.get<PagoResponseModel>(`${this.API_URL}/${uuid}`);
    }

    // READ: listar pagos por método de pago
    getByMetodoPago(metodoDePago: string): Observable<PagoResponseModel[]> {
        return this.http.get<PagoResponseModel[]>(
            this.API_URL_METODOPAGO,
            { params: { metodoDePago } }
        );
    }

    // READ: listar pagos por estado
    getByEstado(estado: string): Observable<PagoResponseModel[]> {
        return this.http.get<PagoResponseModel[]>(
            this.API_URL_ESTADO,
            { params: { estado } }
        );
    }

    // READ: listar pagos realizados por un cliente
    getByCliente(uuid: string): Observable<PagoResponseModel[]> {
        return this.http.get<PagoResponseModel[]>(
            `${this.API_URL_PAGOSCLIENTE}/${uuid}`
        );
    }

    // READ: listar pagos recibidos por un técnico
    getByTecnico(uuid: string): Observable<PagoResponseModel[]> {
        return this.http.get<PagoResponseModel[]>(
            `${this.API_URL_PAGOSTECNICO}/${uuid}`
        );
    }

    // READ: consultar una orden de Mercado Pago
    consultarOrden(orderId: string): Observable<unknown> {
        return this.http.get<unknown>(
            `${this.API_URL_MP_ORDEN}/${orderId}`
        );
    }

    // READ: buscar un pago por ID de orden de Mercado Pago
    getByMercadoPagoOrderId(
        mercadoPagoOrderId: string
    ): Observable<PagoResponseModel> {
        return this.http.get<PagoResponseModel>(
            `${this.API_URL_MP_ORDEN}/${mercadoPagoOrderId}/pago`
        );
    }

    // UPDATE: cancelar un pago
    cancelarPago(uuid: string): Observable<PagoResponseModel> {
        return this.http.patch<PagoResponseModel>(
            `${this.API_URL}/${uuid}/cancelar`,
            {}
        );
    }
}
