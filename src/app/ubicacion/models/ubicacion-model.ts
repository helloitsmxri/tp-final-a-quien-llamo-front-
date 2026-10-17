import { UsuarioModel } from "../../user/models/user-model";


export interface UbicacionModel {
    idUbicacion: number;
    usuario: UsuarioModel;
    codigoPostal: string;
    provincia: string;
    ciudad: string;
    calle: string;
    numero: number | null;
    piso: number | null;
    numeroPiso: number | null;
    uuid: string;
}
