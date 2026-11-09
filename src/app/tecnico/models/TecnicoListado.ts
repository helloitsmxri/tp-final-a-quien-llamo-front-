
export interface TecnicoListadoModel {
  uuid: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  sobreMi: string;
  fotoBase64: string | null;
  tipoImagen: string | null;
  descripcionTrabajo: string;
  habilidades: string[];
  especialidades: string[];
}
