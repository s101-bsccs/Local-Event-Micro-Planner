import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'events/create',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/event-editor/event-editor.component').then((m) => m.EventEditorComponent)
  },
  {
    path: 'events/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/event-view/event-view.component').then((m) => m.EventViewComponent)
  },
  {
    path: 'events/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/event-editor/event-editor.component').then((m) => m.EventEditorComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard-page/dashboard-page.component').then((m) => m.DashboardPageComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
