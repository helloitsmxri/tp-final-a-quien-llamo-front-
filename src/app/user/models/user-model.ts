import { DenunciaModel } from "../../denuncia/models/denuncia-model";
import { PresupuestoModel } from "../../presupuesto/models/presupuesto-model";
import { RatingModel } from "../../rating/models/rating-model";
import { TecnicoModel } from "../../tecnico/models/tecnico-model";
import { UbicacionModel } from "../../ubicacion/models/ubicacion-model";


export interface UsuarioModel {
    idUsuario?: number;
    uuid: string;

    tipoImagen: string;
    foto: string | null;

    dni: string;
    nombre: string;
    apellido: string;
    email: string;
    clave: string;
    telefono: string;

    fechaNacimiento: string;
    ultimaActividad: string;
    sobreMi: string;

    activo: boolean;
    fechaFinSuspension: string | null;

    tecnico?: TecnicoModel | null;
    ubicaciones?: UbicacionModel[];

    calificacionesEnviadas?: RatingModel[];
    calificacionesRecibidas?: RatingModel[];

    presupuestosSolicitados?: PresupuestoModel[];

    denunciasRealizadas?: DenunciaModel[];
    denunciasRecibidas?: DenunciaModel[];
}

