export interface MensajeModel {
  uuidMensaje: string;
  uuidChat: string;
  uuidSender: string;
  nombreSender?: string;
  mensaje?: string | null;
  fechaMensaje?: string;
  archivoUrl?: string | null;
  tipoArchivo?: string | null;
}