export interface UsuarioRegisterModel {

    nombre: string;
    dni: string;
    apellido: string;
    email: string;
    clave: string;
    telefono: string;
    fechaNacimiento: string;
    sobreMi: string;
    foto: File | null; // el backend ya obtiene todo de este archivo la tipo de imagen y eso
}