import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.isLoggedIn()) {
        // Token is invalid or expired — force logout to clean up state.
        authService.logout();
        router.navigate(['/login']);
      }

      // Re-throw so individual components can still handle
      // specific errors (e.g. validation messages, field errors).
      return throwError(() => error);
    })
  );
};
