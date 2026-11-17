import { EstadoPago } from "../enum/estado-pago";
import { MetodoDePago } from "../enum/metodo-de-pago";
import { ProveedorPago } from "../enum/proveedor-pago";


export interface PagoResponseModel {
    uuid: string;
    uuidTrabajo: string;
    nombreProyecto: string;
    descripcionProyecto: string;
    proveedorDePago: ProveedorPago;
    metodoDePago: MetodoDePago;
    fechaPago: string;
    estadoPago: EstadoPago;
    checkoutUrl: string | null;
    externalPaymentId: string | null;
    estadoExterno: string | null;
}