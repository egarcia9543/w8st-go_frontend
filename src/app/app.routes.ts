import { Routes } from '@angular/router';
import { Login } from './presentation/pages/login/login';
import { loginGuard } from './presentation/guards/login-guard';
import { authGuard } from './presentation/guards/auth-guard';
import { Dashboard } from './presentation/pages/dashboard/dashboard';
import { MainLayout } from './presentation/layout/main-layout/main-layout';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [loginGuard],
  },
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [authGuard],
      },
      {
        path: 'transacciones',
        loadComponent: () =>
          import('./presentation/pages/transactions/transactions').then((m) => m.Transactions),
        canActivate: [authGuard],
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
