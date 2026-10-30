import { RatingModel } from "../../rating/models/rating-model";
import { RatingResponse } from "../../rating/models/rating-response";

export interface UserProfileDTO{
        uuid: string;
        tipoImagen: string | null;
        foto: string | null; // imagen lista para <img src> (data URL) o base64 + tipoImagen
    
        nombre: string;
        apellido: string;
        telefono : string;
        email : string;
    
        tipoUsuario ?: string;
        ultimaActividad ?: string;
        fechaRegistro ?: string;
        sobreMi: string;

        promedioCalificaciones ?: number;   // lo calcula el back
        cantidadCalificaciones ?: number;
        calificacionesEnviadas ?: RatingResponse[];
        calificacionesRecibidas ?: RatingResponse[];
}