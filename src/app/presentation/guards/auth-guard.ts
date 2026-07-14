import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from '../facades/auth.facade';

export const authGuard: CanActivateFn = () => {
  const facade = inject(AuthFacade);
  const router = inject(Router);

  return facade.sessionState().isAuthenticated ? true : router.createUrlTree(['/login']);
};
