import { EstadoVerificacion } from '../enum/estado-verificacion';

export interface PortfolioAdminModel {
  uuid: string;
  titulo: string;
  uuidTecnico: string;
  nombreTecnico: string;
  nombreEspecialidad: string;
  estadoVerificacion: EstadoVerificacion;
  notasAspirante: string;
  enlaceExterno: string;
  tipoArchivo: string;
  archivoAdjunto: string | null;
  notasAdmin: string | null;
  fechaEntrega: string;
}