import { TecnicoModel } from "../../tecnico/models/tecnico-model";
import { UsuarioModel } from "../../user/models/user-model";


export interface ChatModel {
  idChat?: number;
  uuidChat: string;
  idUsuario:number;
  idTecnico:number;
  uuidUsuario?:string;
  uuidTecnico?: string;
  nombreUsuario?:string;
  nombreTecnico?:string;
}