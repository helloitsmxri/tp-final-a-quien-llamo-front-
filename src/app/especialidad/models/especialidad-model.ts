
import { HabilidadModel } from "../../habilidad/models/habilidad-model";
import { RubroModel } from "../../rubro/models/rubro-model";
import { TecnicoModel } from "../../tecnico/models/tecnico-model";
import { TipoValidacion } from "../enum/tipo-validacion";

export interface EspecialidadModel {
    idEspecialidad: number;
    uuid: string;
    nombreEspecialidad: string;
    tipoValidacion: TipoValidacion | null;
    rubros: RubroModel[];
    habilidades: HabilidadModel[];
    tecnicos: TecnicoModel[];
}   

