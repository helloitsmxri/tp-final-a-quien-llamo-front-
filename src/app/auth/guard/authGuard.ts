import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";

export const authGuard : CanActivateFn = () => {
    const router = inject(Router);
    const haySesion = !!localStorage.getItem('token');
    return haySesion ? true : router.createUrlTree(['/login']);
}

// entiendo yo q esto lo q hace es q se fija si hay sesión y si no hay, le manda al login! para q entre ahre