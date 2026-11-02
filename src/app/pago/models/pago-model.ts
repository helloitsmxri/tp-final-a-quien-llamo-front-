import { EstadoPago } from "../enum/estado-pago";
import { MetodoDePago } from "../enum/metodo-de-pago";


export interface PagoModel {
    uuid: string;
    uuidTrabajo: string;
    metodoDePago: MetodoDePago;
    fechaPago: string;
    estadoPago: EstadoPago;
    checkoutUrl: string | null;
    mercadoPagoOrderId: string | null;
}