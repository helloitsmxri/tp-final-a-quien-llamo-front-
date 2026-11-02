export interface UsuarioRegisterResponseModel{
    uuid : string;
    nombre : string;
    apellido : string;
    email : string;
    telefono : string;
    sobreMi : string;
    fotoBase64 : string | null;
    tipoImagen : string;
    tipoUsuario : string;
    fechaRegistro : string;
    ultimaActividad : string;
}