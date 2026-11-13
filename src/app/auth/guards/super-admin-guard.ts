import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth-service";
import { catchError, map, of } from "rxjs";

export const superAdminGuard: CanActivateFn = () => {

    const router = inject(Router);
    const authService = inject(AuthService);

    return authService.validarSuperAdmin().pipe(

        map(() => true),

        catchError((error) => {

            if (error.status === 401) {
                localStorage.removeItem('accessToken');
                return of(router.createUrlTree(['/iniciar-sesion']));
            }

            return of(router.createUrlTree(['/home']));
        })

    );

};