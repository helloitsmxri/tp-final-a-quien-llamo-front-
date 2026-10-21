import { EstadoTrabajo } from "../enum/estado-trabajo"


export interface FormTrabajoModel {
    uuidPresupuesto:string
    descripcionTrabajo: string
    fechaEstimadaInicio: string
    fechaEstimadaFin: string,
    estadoTrabajo: EstadoTrabajo
}
