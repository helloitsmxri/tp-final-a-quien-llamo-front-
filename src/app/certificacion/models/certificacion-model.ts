import { EstadoVerificacion } from "../enum/estado-verificacion";


export interface CertificacionModel {
  uuid: string;
  nombreTecnico: string;
  apellidoTecnico: string;
  numMatricula: string;
  enteOtorgador: string;
  fechaVencimiento: string;
  imagenBase64: string;
  tipoImagen: string;
  estadoVerificacion: EstadoVerificacion;
  notasAdmin: string | null;
}