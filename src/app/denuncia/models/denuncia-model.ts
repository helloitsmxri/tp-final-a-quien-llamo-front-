import { UsuarioModel } from "../../user/models/user-model";
import { EstadoDenuncia } from "../enum/estado-denuncia";


export interface DenunciaModel {
    idDenuncia: number;
    uuid: string;
    administrador: UsuarioModel | null;
    denunciante: UsuarioModel;
    denunciado: UsuarioModel;
    estadoDenuncia: EstadoDenuncia;
    motivoDenuncia: string;
    notaDelAdmin: string | null;
    fechaDenuncia: string;
    tipoFoto: string | null;
    foto: string | null;
}