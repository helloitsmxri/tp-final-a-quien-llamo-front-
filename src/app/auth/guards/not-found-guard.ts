import { CanActivateFn, RedirectCommand, Router } from '@angular/router';
import { inject } from '@angular/core';

export const notFoundGuard: CanActivateFn = () => {
  const router = inject(Router);

  return new RedirectCommand(
    router.createUrlTree(['/home'], {
      queryParams: { error: 'not-found' }
    })
  );
};