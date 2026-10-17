import { TecnicoModel } from "../../tecnico/models/tecnico-model";
import { UsuarioModel } from "../../user/models/user-model";


export interface ChatModel {
  idChat: number;
  usuario: UsuarioModel;
  tecnico: TecnicoModel;
  fechaChat: string;
  uuidChat: string;
}