export interface UserPatchModel{
    tipoImagen: string;
    foto: string | null;

    nombre: string;
    apellido: string;
    email: string;
    telefono: string;

    sobreMi: string;
}