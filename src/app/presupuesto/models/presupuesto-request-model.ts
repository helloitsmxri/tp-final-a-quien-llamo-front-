import { PresupuestoDetalleRequestModel } from "./presupuesto-detalle-request";

export interface PresupuestoRequestModel{
nombreProyecto: string;
  observaciones: string;
  descuentoPorcentaje: number;
  detalles: PresupuestoDetalleRequestModel[];
}