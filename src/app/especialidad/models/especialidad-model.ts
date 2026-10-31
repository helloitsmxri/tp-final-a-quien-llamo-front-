import { TipoValidacion } from "../enum/tipo-validacion";

export interface EspecialidadModel {
    uuid: string;
    nombreEspecialidad: string;
    tipoValidacion: TipoValidacion | null;
    rubros: string[];
    habilidades: string[];
}   

