import { RatingModel } from "../../rating/models/rating-model";
import { TipoCaracteristica } from "../enum/tipo-caracteristica";


export interface CaracteristicaModel {
    idCaracteristica: number;
    uuid: string;
    valorAdjetivo: string;
    tipo: TipoCaracteristica;
    ratings: RatingModel[];
}
