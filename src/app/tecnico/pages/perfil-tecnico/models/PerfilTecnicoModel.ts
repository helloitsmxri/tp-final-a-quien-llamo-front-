  export interface PerfilTecnicoModel{
    uuid: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    sobreMi: string;
    fotoBase64: string | null;
    tipoImagen: string | null;
    cuit: string;
    descripcionTrabajo: string;
    proyectos: string;
    habilidades: string[];
    especialidades: string[];
  }
