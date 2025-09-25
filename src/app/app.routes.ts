import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'movies',
    loadChildren: () => import('./features/movies/movies.routes').then(m => m.MOVIE_ROUTES)
  },
  {
    path: 'marathons',
    loadComponent: () => import('./features/marathons/pages/marathon-management/marathon-management.component').then(m => m.MarathonManagementComponent)
  },
  {
    path: '',
    redirectTo: 'movies',
    pathMatch: 'full'
  }
];
