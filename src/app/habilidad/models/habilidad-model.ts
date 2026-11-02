import { EspecialidadModel } from "../../especialidad/models/especialidad-model";
import { TecnicoModel } from "../../tecnico/models/tecnico-model";

export interface HabilidadModel {
    uuid: string;
    nombreHabilidad: string;
    especialidades: string[];
}
