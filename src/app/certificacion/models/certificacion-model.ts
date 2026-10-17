import { TecnicoModel } from "../../tecnico/models/tecnico-model";
import { UsuarioModel } from "../../user/models/user-model";
import { EstadoVerificacion } from "../enum/estado-verificacion";


export interface CertificacionModel {
    idCertificacion: number;
    uuid: string;
    tecnico: TecnicoModel;
    numMatricula: string;
    enteOtorgador: string;
    fechaVencimiento: string | null;
    tipoImagen: string;
    imagenCertificado: string;
    adminRevisor: UsuarioModel | null;
    estadoVerificacion: EstadoVerificacion;
    notasAdmin: string | null;
}