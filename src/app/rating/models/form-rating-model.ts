

export interface FormRatingModel {
        idRating?: number;
        uuidRemitente: string;
        uuidDestinatario: string;
        usuarioDestinatario: string;
        valoracion: number;
        descripcion: string | null;
        tipoFoto: string | null;
        foto: string | null;
        caracteristicas: string[];
}
