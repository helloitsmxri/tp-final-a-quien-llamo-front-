import { ChatModel } from "../../chat/models/chat-model";
import { TecnicoModel } from "../../tecnico/models/tecnico-model";
import { UsuarioModel } from "../../user/models/user-model";
import { EstadoPresupuesto } from "../enum/estado-presupuesto";


export interface PresupuestoModel {
    id_presupuesto: number;
    uuid: string;
    usuario: UsuarioModel;
    chat: ChatModel;
    tecnico: TecnicoModel;
    precioEstimado: number;
    descripcionPresupuesto: string;
    estado: EstadoPresupuesto;
}