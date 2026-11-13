export interface RatingModel {
  uuidTrabajo: string;
  valoracion: number;
  descripcion?: string;
  tipoFoto?: string;
  foto?: string | null;
  uuidCaracteristicas: string[];
}