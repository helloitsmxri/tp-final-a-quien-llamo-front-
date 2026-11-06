export interface CertificacionEdicionDatos {
  titulo: string;
  uuidEspecialidad: string;
  numMatricula: string;
  enteOtorgador: string;
  fechaVencimiento: string;
  archivo: File | null;
}