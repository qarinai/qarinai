import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  console.log('Auth Guard Activated');
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect to login if no token is found
    router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
  return true;
};
