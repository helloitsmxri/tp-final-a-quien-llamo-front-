import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth-service";
import { catchError, map, of } from "rxjs";

export const authGuard: CanActivateFn = () => {

    const router = inject(Router);
    const authService = inject(AuthService);

    const accessToken = localStorage.getItem('accessToken');

    // Si no existe el token, redirige al login.
    if (!accessToken) {
        return router.createUrlTree(['/iniciar-sesion']);
    }

    // Si existe, consulta al backend para validar su autenticidad.
    return authService.validarToken().pipe(

        // Si el backend responde correctamente, permite el acceso.
        map(() => true),

        // Si el backend devuelve un error, elimina el token y redirige.
        catchError(() => {
            localStorage.removeItem('accessToken');

            return of(router.createUrlTree(['/iniciar-sesion']));
        })

    );

};