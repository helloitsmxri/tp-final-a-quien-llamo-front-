import { TipoCaracteristica } from '../enum/tipo-caracteristica';

export interface CaracteristicaModel {
  uuid: string;
  valorAdjetivo: string;
  tipo: TipoCaracteristica;
}