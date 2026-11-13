import { CanDeactivateFn } from '@angular/router';

export const outForm: CanDeactivateFn<any> = (component) => {

    if (component.formulario?.dirty) {
        return window.confirm('¿Estás seguro de que querés salir del formulario? Los cambios podrían perderse.');
    }

    return true;
};