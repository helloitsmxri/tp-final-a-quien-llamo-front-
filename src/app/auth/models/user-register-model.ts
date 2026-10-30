export interface UsuarioRegisterModel {

    nombre: string;
    dni: string;
    apellido: string;
    email: string;
    clave: string;
    telefono: string;

    fechaNacimiento: string;
    sobreMi: string;
    tipoImagen: string;
    foto: string | null;
}