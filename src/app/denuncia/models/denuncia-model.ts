import { EstadoDenuncia } from "../enum/estado-denuncia";

export interface DenunciaModel{
    uuid : string;

    uuidAdministrador : string | null;
    nombreAdministrador : string | null;

    uuidDenunciante : string;
    nombreDenunciante : string;
    apellidoDenunciante : string;
    emailDenunciante : string;

    uuidDenunciado : string;
    nombreDenunciado : string;
    apellidoDenunciado : string;
    emailDenunciado : string;

    estadoDenuncia : EstadoDenuncia;

    motivoDenuncia : string;
    notaDelAdmin : string | null;

    fechaDenuncia : string;

    tieneFoto : boolean;
    tipoFoto : string | null;
}