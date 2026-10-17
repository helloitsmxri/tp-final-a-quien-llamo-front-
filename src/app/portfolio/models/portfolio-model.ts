import { EspecialidadModel } from "../../especialidad/models/especialidad-model";
import { TecnicoModel } from "../../tecnico/models/tecnico-model";
import { EstadoVerificacion } from "../enum/estado-verificacion";

export interface PortfolioModel {
    idPortfolio: number;
    uuid: string;
    tecnico: TecnicoModel;
    especialidad: EspecialidadModel;
    notasAspirante: string | null;
    enlaceExterno: string | null;
    tipoArchivo: string | null;
    archivoAdjunto: string | null;
    estadoVerificacion: EstadoVerificacion;
    notasAdmin: string | null;
    fechaEntrega: string;
}
