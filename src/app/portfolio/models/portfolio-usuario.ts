import { EstadoVerificacion } from "../enum/estado-verificacion";

export interface PortfolioUsuarioModel {
  uuid: string;
  titulo: string;
  uuidEspecialidad: string;
  nombreEspecialidad: string;
  notasAspirante: string | null;
  enlaceExterno: string | null;
  tipoArchivo: string | null;
  archivoAdjunto: string | null;
  estadoVerificacion: EstadoVerificacion;
  notasAdmin: string | null;
  fechaEntrega: string;
}