import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { authGuard } from './app/auth/auth.guard';

export const appRoutes: Routes = [
  {
    path: 'chat',
    loadChildren: () => import('./app/chat/chat.routes').then((m) => m.default)
  },
  {
    path: 'auth',
    loadChildren: () => import('./app/auth/auth.routes').then((m) => m.default)
  },
  {
    path: '',
    redirectTo: 'pages',
    pathMatch: 'full'
  },
  {
    path: 'pages',
    component: AppLayout,
    canActivate: [authGuard],
    loadChildren: () => import('./app/pages/pages.routes').then((m) => m.default)
  },
  { path: '**', redirectTo: '/notfound' }
];
