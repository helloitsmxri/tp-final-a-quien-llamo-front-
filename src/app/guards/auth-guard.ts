import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
/*   const router = inject(Router);
  const authService = inject(Auth);

  const token = localStorage.getItem('token');

  if(!token){
    return router.createUrlTree(['/login']);
  }

  return authService.validarToken().pipe(
    map(()=true),
    catchError(()=>{
      localStorage.removeItem('token');
      return of(router.createUrlTree(['/login']));
    })
  )  */
  return true;
};
