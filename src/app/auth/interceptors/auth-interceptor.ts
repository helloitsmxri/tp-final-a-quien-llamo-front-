import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const accessToken = localStorage.getItem('accessToken');

  const request = accessToken ? req.clone({setHeaders:{Authorization:`Bearer ${accessToken}`}}) : req;

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && accessToken) {
        localStorage.removeItem('accessToken');
        router.navigate(['/login']);
      }

      return throwError(() => error);
    })
  );

};
