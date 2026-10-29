import { RatingModel } from "../../rating/models/rating-model";

export interface UserProfileDTO{
        uuid: string;
        tipoImagen: string | null;
        foto: string | null;
    
        nombre: string;
        apellido: string;
        telefono : string;
        email : string;
    
        tipoUsuario ?: string;
        ultimaActividad ?: string;
        fechaRegistro ?: string;
        sobreMi: string;

        calificacionesEnviadas?: RatingModel[];
        calificacionesRecibidas?: RatingModel[];
}