import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'mcp-servers',
    loadChildren: () => import('./mcp-servers/mcp-servers.routes').then((m) => m.default)
  },
  {
    path: 'chat-providers',
    loadChildren: () => import('./chat-providers/chat-providers.routes').then((m) => m.default)
  },
  {
    path: 'agents',
    loadChildren: () => import('./agents/agents.routes').then((m) => m.default)
  },
  {
    path: 'vector-stores',
    loadChildren: () => import('./vector-stores/vector-stores.routes').then((m) => m.default)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.routes').then((m) => m.default)
  },
  {
    path: 'help',
    loadChildren: () => import('./help/help.routes').then((m) => m.default)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then((m) => m.default)
  },
  {
    path: 'personal-access-tokens',
    loadChildren: () => import('./pat/pat.routes').then((m) => m.default)
  }
] as Routes;
