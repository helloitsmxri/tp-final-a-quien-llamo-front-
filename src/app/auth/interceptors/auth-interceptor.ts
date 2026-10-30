import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const accesToken = localStorage.getItem('accesToken');

  const request = accesToken ? req.clone({setHeaders:{Authorization:`Bearer ${accesToken}`}}) : req;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && accesToken) {
        localStorage.removeItem('accesToken');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );

};
