import { Routes } from '@angular/router';

export default [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then((m) => m.DashboardComponent)
  }
] as Routes;
