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

    // Validar token en el backend.
    return authService.validarToken().pipe(

        map(() => true),

        catchError((error) => {

            // Token inválido o vencido.
            if (error.status === 401) {
                authService.logout();

                return of(router.createUrlTree(['/iniciar-sesion']));
            }

            // Error del servidor u otro problema.
            console.error('Error al validar el token:', error);

            return of(false);
        })

    );
};