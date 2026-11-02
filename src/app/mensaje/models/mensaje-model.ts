import { ChatModel } from "../../chat/models/chat-model";
import { UsuarioModel } from "../../user/models/user-model";


export interface MensajeModel {
    idMensaje?: string;
    uuidChat:string;
    uuidSender: string;
    mensaje?: string | null;
    fechaMensaje?: string;
    archivoUrl?: string | null;
    tipoArchivo?: string | null;
    uuidMensaje?: string;
    fechaCreacion?:string;
}
