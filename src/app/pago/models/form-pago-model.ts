import { MetodoDePago } from "../enum/metodo-de-pago";

export interface FormPagoModel {
    
    uuidTrabajo: string;
    metodoDePago: MetodoDePago;
    buyerFullName: string;
    buyerEmail: string;
    buyerDNI: string;
    buyerPhone: string;
    monto: string;
    currency: string;
    numeroTarjeta: string;
    cvv: string;
    vencimientoTarjeta: string;
    franquicia: string;
}
