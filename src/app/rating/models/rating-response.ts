export interface RatingResponse {
    uuidRemitente: string;
    nombreRemitente: string;
    nombreDestinatario: string;
    valoracion: number;
    descripcion: string | null;
    tipoFoto: string | null;
    foto: string | null;         
    caracteristicas: string[];      
}