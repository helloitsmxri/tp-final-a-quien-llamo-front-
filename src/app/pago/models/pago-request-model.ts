import { MetodoDePago } from "../enum/metodo-de-pago";

export interface PagoRequestModel {
    uuidTrabajo: string;
    metodoDePago: MetodoDePago;
    buyerFullName: string;
    buyerEmail: string;
    buyerDNI: string;
    buyerPhone: string;
}
