import { EspecialidadModel } from "../../especialidad/models/especialidad-model";
import { TecnicoModel } from "../../tecnico/models/tecnico-model";

export interface HabilidadModel {
    idHabilidad: number;
    uuid: string;
    nombreHabilidad: string;
    especialidades: EspecialidadModel[];
    tecnicos: TecnicoModel[];
}
