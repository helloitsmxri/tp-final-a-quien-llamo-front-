import { ChatModel } from "../../chat/models/chat-model";
import { TecnicoModel } from "../../tecnico/models/tecnico-model";
import { UsuarioModel } from "../../user/models/user-model";
import { EstadoPresupuesto } from "../enum/estado-presupuesto";
import { PresupuestoDetalleModel } from "./presupuesto-detalle";


export interface PresupuestoModel {
    // base
    uuid : string;

    // tech
    nombreTecnico : string;
    apellidoTecnico : string;

    //user
    nombreUsuario : string;
    apellidoUsuario : string;

    nombreProyecto : string;
    observaciones : string;

    detalles: PresupuestoDetalleModel[];
    estado : EstadoPresupuesto;

    subtotal : number;
    descuentoPorcentaje : number;
    montoDescuento : number;

    // precio final
    precioEstimado : number;
}