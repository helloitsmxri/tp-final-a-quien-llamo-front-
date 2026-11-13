import { PresupuestoModel } from "../../presupuesto/models/presupuesto-model";
import { EstadoTrabajo } from "../enum/estado-trabajo";

export interface TrabajoModel {
    uuid: string;

    // --- presupuesto ---
    uuidPresupuesto: string;
    nombreProyecto: string;
    precioEstimado: number;
    uuidChat: string | null;

    // --- cliente ---
    uuidCliente: string;
    nombreCliente: string;
    apellidoCliente: string;

    // --- técnico ---
    uuidUsuarioTecnico: string;
    nombreTecnico: string;
    apellidoTecnico: string;

    // --- trabajo ---
    descripcionTrabajo: string;
    fechaEstimadaInicio: string;
    fechaEstimadaFin: string;
    estadoTrabajo: EstadoTrabajo;
}