import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth-service";

export const authGuard : CanActivateFn = () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const accessToken = localStorage.getItem('accessToken');
    return accessToken ? true : router.createUrlTree(['/login']);


}

//me sirve por ejemplo si me voy de un formulario y todavia no lo termine (canDeactivate)