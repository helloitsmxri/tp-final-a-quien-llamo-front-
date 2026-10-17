import { EspecialidadModel } from "../../especialidad/models/especialidad-model";
import { HabilidadModel } from "../../habilidad/models/habilidad-model";
import { UsuarioModel } from "../../user/models/user-model";


export interface TecnicoModel {
    idTecnico: number;
    uuid: string;
    usuario: UsuarioModel;
    cuit: string;
    descripcionTrabajo: string;
    proyectos: string;
    habilidades: HabilidadModel[];
    especialidades: EspecialidadModel[];
}
