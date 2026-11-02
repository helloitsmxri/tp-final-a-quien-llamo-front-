import { CaracteristicaModel } from "../../caracteristica/models/caracteristica-model";
import { UsuarioModel } from "../../user/models/user-model";


export interface RatingModel {
    uuidRemitente : string;
    uuidDestinatario : string;
    valoracion : number;
    descripcion ?: string;
    tipoFoto: string;
    foto: string | null;
    uuidCaracteristicas : string[];
}