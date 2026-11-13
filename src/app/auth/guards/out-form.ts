import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
    canDeactivate: () => boolean;
}

export const outForm: CanDeactivateFn<CanComponentDeactivate> = (component) => {
    return component.canDeactivate ? component.canDeactivate() : true;
};