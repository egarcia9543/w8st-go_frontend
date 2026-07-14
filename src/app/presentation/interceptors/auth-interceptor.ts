import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthFacade } from '../facades/auth.facade';
import { catchError, throwError } from 'rxjs';

const EXCLUDED_URLS = ['/auth/'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const facade = inject(AuthFacade);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const isExcludedUrl = EXCLUDED_URLS.some((url) => req.url.includes(url));
      if (!isExcludedUrl && error.status === 401) {
        facade.clearSession();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
