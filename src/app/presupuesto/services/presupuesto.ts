
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PresupuestoModel } from '../models/presupuesto-model';
import { PresupuestoRequestModel } from '../models/presupuesto-request-model';

@Injectable({ providedIn: 'root' })
export class PresupuestoService {

    private http = inject(HttpClient);
    private url = 'http://localhost:8080/aquienllamo/presupuestos';

    // CREAR PRESUPUESTO
    crearPresupuesto(uuidChat : string, presupuesto : PresupuestoRequestModel){
        return this.http.post<PresupuestoModel>(`${this.url}/chat/${uuidChat}`, presupuesto);
    }

    // MODIFICAR PRESUPUESTO
    modificarPresupuesto(uuid : string, presupuesto : PresupuestoRequestModel){
        return this.http.put<void>(`${this.url}/${uuid}`, presupuesto);
    }

    // OBTENER UN PRESUPUESTO ESPECÍFICO
    obtenerPresupuesto (uuid : string){
        return this.http.get<PresupuestoModel>(`${this.url}/${uuid}`);
    }

    // OBTENER PRESUPUESTOS DE UN CHAT
    obtenerPresupuestoChat(uuidCHat : string){
        return this.http.get<PresupuestoModel[]>(`${this.url}/chat/${uuidCHat}`);
    }

    // OBTENER MIS PRESUPUESTOS
    obtenerMisPresupuestos(tipo: 'CREADOS' | 'RECIBIDOS') {

        if (tipo === 'CREADOS') {
        return this.http.get<PresupuestoModel[]>(`${this.url}/mis-presupuestos-tecnico`);
        }
        
        return this.http.get<PresupuestoModel[]>(`${this.url}/mis-presupuestos`);
    }

    // ACEPTAR PRESUPUESTO
    aceptarPresupuesto(uuid : string){
        return this.http.patch<void>(`${this.url}/${uuid}/aceptar`, {});
    }

    // RECHAZAR PRESUPUESTO
    rechazarPresupuesto (uuid : string){
        return this.http.patch<void>(`${this.url}/${uuid}/rechazar`, {});
    }


    // CANCELAR PRESUPUESTO
    cancelarPresupuesto (uuid : string){
        return this.http.patch<void>(`${this.url}/${uuid}/cancelar`, {});
    }
}

