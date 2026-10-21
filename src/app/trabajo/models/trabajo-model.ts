import { PresupuestoModel } from "../../presupuesto/models/presupuesto-model";
import { EstadoTrabajo } from "../enum/estado-trabajo";

export interface TrabajoModel {
    idTrabajo?: number;
    uuid: string;
    presupuesto: PresupuestoModel | null;
    descripcionTrabajo: string;
    fechaEstimadaInicio: string;
    fechaEstimadaFin: string;
    estadoTrabajo: EstadoTrabajo;
}
