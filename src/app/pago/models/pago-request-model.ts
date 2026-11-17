import { MetodoDePago } from "../enum/metodo-de-pago";
import { ProveedorPago } from "../enum/proveedor-pago";

export interface PagoRequestModel {
    uuidTrabajo: string;
    metodoDePago: MetodoDePago;
    proveedorDePago: ProveedorPago;
    buyerFullName: string;
    buyerEmail: string;
    buyerDNI: string;
    buyerPhone: string;
}
