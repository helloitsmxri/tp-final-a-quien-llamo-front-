import { TrabajoModel } from "../../trabajo/models/trabajo-model";
import { Estado } from "../enum/estado";
import { MetodoDePago } from "../enum/metodo-de-pago";


export interface PagoModel {
    idPago: number;
    uuid: string;
    trabajo: TrabajoModel | null;
    metodoDePago: MetodoDePago;
    fechaPago: string;
    estadoPago: Estado;
}