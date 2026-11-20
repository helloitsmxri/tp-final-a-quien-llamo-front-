import { Injectable, signal } from "@angular/core";
import { AlertaModel, tipoAlerta } from "../model/alerta-model";

@Injectable({
  providedIn: 'root'
})
export class AlertaService{

    // lista de alertas
    private alertasSignal = signal<AlertaModel[]>([]);

    // lista sólo lectura
    alertas = this.alertasSignal.asReadonly();
    
    // identificador p c alerta
    private siguienteId = 0;

    // generar una alerta
    mostrar(tipo: tipoAlerta, mensaje : string, duracion : number = 4000): void{
        
        const id = ++this.siguienteId;

        const nuevaAlerta : AlertaModel = {
            id, 
            tipo,
            mensaje,
            duracion
        };

        this.alertasSignal.update(listaAlertas => [...listaAlertas, nuevaAlerta])
    
        // si la alerta tine duración se elimina automáticamente
        if (duracion > 0){-
            setTimeout(() => {
                this.cerrar(id);
            }, duracion);
        }
    }

    // Mostrar una alerta de éxito.
    exito(mensaje: string, duracion: number = 4000): void {
        this.mostrar('exito', mensaje, duracion);
    }

    // Mostrar una alerta de error.
    error(mensaje: string, duracion: number = 5000): void {
        this.mostrar('error', mensaje, duracion);
    }

    // Mostrar una advertencia.
    advertencia(mensaje: string, duracion: number = 4000): void {
        this.mostrar('advertencia', mensaje, duracion);
    }

    // Mostrar un mensaje informativo.
    info(mensaje: string, duracion: number = 4000): void {
        this.mostrar('info', mensaje, duracion);
    }

    //Mostrar una alerta de confirmación con botones Confirmar/Cancelar.
    confirmar(mensaje:string, alConfirmar: ()=> void, alCancelar?:()=>void):void{
        const id = ++this.siguienteId;

        const nuevaAlerta: AlertaModel = {
            id,
            tipo: 'advertencia',
            mensaje,
            duracion: 0,
            esConfirmacion: true,
            alConfirmar,
            alCancelar
    };

    this.alertasSignal.update(listaAlertas => [...listaAlertas, nuevaAlerta]);
}
    // Confirmar una alerta específica.
    aceptarConfirmacion(id: number): void {
        const alerta = this.alertasSignal().find(a => a.id === id);
        this.cerrar(id);
        alerta?.alConfirmar?.();
    }

    // Cancelar una alerta específica.
    cancelarConfirmacion(id: number): void {
        const alerta = this.alertasSignal().find(a => a.id === id);
        this.cerrar(id);
        alerta?.alCancelar?.();
    }

    // Cerrar una alerta específica.
    cerrar(id: number): void {
        this.alertasSignal.update(alertas =>
        alertas.filter(alerta => alerta.id !== id)
        );
    }

    // Cerrar todas las alertas.
    cerrarTodas(): void {
        this.alertasSignal.set([]);
    }
}