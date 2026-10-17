import { CaracteristicaModel } from "../../caracteristica/models/caracteristica-model";
import { UsuarioModel } from "../../user/models/user-model";


export interface RatingModel {
    idRating: number;
    uuid: string;
    usuarioRemitente: UsuarioModel;
    usuarioDestinatario: UsuarioModel;
    valoracion: number;
    descripcion: string | null;
    tipoFoto: string | null;
    foto: string | null;
    caracteristicas: CaracteristicaModel[];
}