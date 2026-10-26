import { EspecialidadModel } from "../../especialidad/models/especialidad-model";

export interface RubroModel {
    idRubro : number;
    uuid : string;
    nombreRubro : string;
    especialidades : string[];
}
