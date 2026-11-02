import { EspecialidadModel } from "../../especialidad/models/especialidad-model";

export interface RubroModel {
    idRubro : number;
    uuidRubro : string;
    nombreRubro : string;
    especialidades : string[];
}
