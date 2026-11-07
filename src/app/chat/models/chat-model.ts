export interface ChatModel {
  uuidChat: string;
  fechaChat?: string;
  uuidUsuario: string;   // el cliente del chat
  nombreUsuario: string;
  uuidTecnico: string;   // el técnico del chat
  nombreTecnico: string;
}