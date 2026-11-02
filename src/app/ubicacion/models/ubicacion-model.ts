import { UsuarioModel } from "../../user/models/user-model";


export interface UbicacionModel {
  uuid?: string;
  codigoPostal: string;
  provincia: string;
  ciudad: string;
  calle: string;
  numero: string;
  piso?: string;
  numeroPiso?: string;
}
