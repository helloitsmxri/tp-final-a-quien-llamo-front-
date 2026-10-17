import { ChatModel } from "../../chat/models/chat-model";
import { UsuarioModel } from "../../user/models/user-model";


export interface MensajeModel {
    idMensaje: number;
    sender: UsuarioModel;
    chat: ChatModel;
    mensaje: string | null;
    fechaMensaje: string;
    archivoUrl: string | null;
    tipoArchivo: string | null;
    uuidMensaje: string;
}
