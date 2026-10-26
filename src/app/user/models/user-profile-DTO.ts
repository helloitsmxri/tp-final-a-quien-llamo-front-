import { RatingModel } from "../../rating/models/rating-model";

export interface UserProfileDTO{
        uuid: string;
        tipoImagen: string;
        foto: string | null;
    
        nombre: string;
        apellido: string;
    
        fechaNacimiento: string;
        ultimaActividad: string;
        sobreMi: string;
    
        calificacionesEnviadas?: RatingModel[];
        calificacionesRecibidas?: RatingModel[];
}