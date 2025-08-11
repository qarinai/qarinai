import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthBackendService } from './auth-backend.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Auth Interceptor Activated');
  const authBackendService = inject(AuthBackendService);

  const token = localStorage.getItem('token');

  if (token) {
    // Clone the request and set the new header in one step.
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(req).pipe(
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            return authBackendService.refresh(refreshToken).pipe(
              switchMap((response) => {
                localStorage.setItem('token', response.access_token);
                localStorage.setItem('refreshToken', response.refresh_token);

                // Clone the request with the new token
                const clonedReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${response.access_token}`
                  }
                });

                // Retry the request with the new token
                return next(clonedReq);
              }),
              catchError((refreshError) => {
                console.error('Refresh token failed', refreshError);
                // If refresh fails, clear tokens and redirect to login
                localStorage.clear();
                window.location.href = '/auth/login'; // Redirect to login page
                return throwError(() => refreshError);
              })
            );
          }
        }

        return throwError(() => error);
      })
    );
  }

  return next(req);
};
