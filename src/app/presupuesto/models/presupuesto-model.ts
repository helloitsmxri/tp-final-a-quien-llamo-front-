import { ChatModel } from "../../chat/models/chat-model";
import { TecnicoModel } from "../../tecnico/models/tecnico-model";
import { UsuarioModel } from "../../user/models/user-model";
import { EstadoPresupuesto } from "../enum/estado-presupuesto";


export interface PresupuestoModel {
    uuid : string;
    nombreTecnico : string;
    apellidoTecnico : string;
    nombreUsuario : string;
    apellidoUsuario : string;
    precioEstimado : number;
    descripcionPresupuesto : string;
    fechaRealizado : string;
    estado : EstadoPresupuesto;
}