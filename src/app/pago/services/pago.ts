
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PagoModel } from '../models/pago-model';

@Injectable({ providedIn: 'root' })
export class PagoService {

    private readonly API_URL = 'http://localhost:8080/aquienllamo/pagos';

    private readonly API_URL_METODOPAGO =`${this.API_URL}/metodoPago`;

    private readonly API_URL_ESTADO =`${this.API_URL}/estado`;

    private readonly API_URL_PAGOSCLIENTE =`${this.API_URL}/cliente`;

    private readonly API_URL_PAGOSTECNICO =`${this.API_URL}/tecnico`;

    private readonly API_URL_MP_ORDEN =`${this.API_URL}/mercado-pago/orden`;

    pagos: PagoModel[] = [];
    pago!: PagoModel;

    constructor(private http: HttpClient) {}

    // CREATE: crear un pago
    store(pago: Partial<PagoModel>): Observable<PagoModel> {
        return this.http.post<PagoModel>(this.API_URL,pago);
    }
    // UPDATE: actualizar un pago
    update(uuid:string,pago: Partial<PagoModel>): Observable<PagoModel>{
        return this.http.patch<PagoModel>(`${this.API_URL}/${uuid}`,pago);
    }

    // READ: obtener todos los pagos
    getAll(): Observable<PagoModel[]> {
        return this.http.get<PagoModel[]>(this.API_URL);
    }

    // READ: obtener un pago por UUID
    getByUuid(uuid: string|null): Observable<PagoModel> {
        return this.http.get<PagoModel>(`${this.API_URL}/${uuid}`);
    }

    // READ: listar pagos por método de pago
    getByMetodoPago(metodoDePago: string): Observable<PagoModel[]> {
        return this.http.get<PagoModel[]>(this.API_URL_METODOPAGO,{params: { metodoDePago }});
    }

    // READ: listar pagos por estado
    getByEstado(estado: string): Observable<PagoModel[]> {
        return this.http.get<PagoModel[]>(this.API_URL_ESTADO,{params:{estado}});
    }

    // READ: listar pagos realizados por un cliente
    getByCliente(uuid: string): Observable<PagoModel[]> {
        return this.http.get<PagoModel[]>(`${this.API_URL_PAGOSCLIENTE}/${uuid}`);
    }

    // READ: listar pagos recibidos por un técnico
    getByTecnico(uuid: string): Observable<PagoModel[]> {
        return this.http.get<PagoModel[]>(`${this.API_URL_PAGOSTECNICO}/${uuid}`);
    }

    // READ: consultar una orden de Mercado Pago
    consultarOrden(orderId: string): Observable<any> {
        return this.http.get<any>(`${this.API_URL_MP_ORDEN}/${orderId}`);
    }

    // READ: buscar un pago por ID de orden de Mercado Pago
    getByMercadoPagoOrderId(mercadoPagoOrderId: string): Observable<PagoModel> {
        return this.http.get<PagoModel>(`${this.API_URL_MP_ORDEN}/${mercadoPagoOrderId}/pago`);
    }

    // UPDATE: cancelar un pago
    cancelarPago(uuid: string): Observable<PagoModel> {
        return this.http.patch<PagoModel>(`${this.API_URL}/${uuid}/cancelar`,{});
    }
}