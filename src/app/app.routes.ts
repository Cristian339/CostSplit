import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/auth/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'amigos',
    loadComponent: () => import('./features/amigos/amigos.component').then((m) => m.AmigosComponent),
    canActivate: [authGuard],
  },
  // Rutas de grupos (añadidas)
  {
    path: 'grupos',
    loadComponent: () => import('./features/grupos/grupo-list/grupo-list.component').then(m => m.GrupoListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'grupos/nuevo',
    loadComponent: () => import('./features/grupos/grupo-form/grupo-form.component').then(m => m.GrupoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'grupos/:id',
    loadComponent: () => import('./features/grupos/grupo-detail/grupo-detail.component').then(m => m.GrupoDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'grupos/:id/editar',
    loadComponent: () => import('./features/grupos/grupo-form/grupo-form.component').then(m => m.GrupoFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'grupos/:idGrupo/liquidaciones',
    loadComponent: () => import('./features/liquidaciones/liquidacion-list/liquidacion-list.component').then(m => m.LiquidacionListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'grupos/:idGrupo/gastos/:idGasto/editar',
    loadComponent: () => import('./features/gastos/gasto-edit/gasto-edit.component').then(m => m.GastoEditComponent),
    canActivate: [authGuard]
  },
  {
    path: 'informes',
    loadComponent: () => import('./features/informes/informes.component').then(m => m.InformesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'ayuda',
    loadComponent: () => import('./features/ayuda/ayuda.component').then(m => m.AyudaComponent),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/user-settings/user-settings.component').then(m => m.UserSettingsComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
