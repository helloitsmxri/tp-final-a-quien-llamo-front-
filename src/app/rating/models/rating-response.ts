export interface RatingResponse {
    uuidCalificacion: string;
    uuidRemitente: string;
    nombreRemitente: string;
    apellidoRemitente: string;
    nombreDestinatario: string;
    valoracion: number;
    descripcion ?: string | null;
    tipoFoto ?: string | null;
    foto ?: string | null;         
    caracteristicas: string[];      
}