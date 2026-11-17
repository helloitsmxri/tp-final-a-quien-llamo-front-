export type tipoAlerta = 'exito' | 'error' | 'advertencia' | 'info';

export interface AlertaModel {
    id : number;
    tipo: tipoAlerta;
    mensaje : string;
    duracion : number;
}