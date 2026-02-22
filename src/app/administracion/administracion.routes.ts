import { Routes } from '@angular/router';
import { AdministracionComponent } from './administracion.component';
import { GestionRolesComponent } from './gestion-roles/gestion-roles.component';
import { GestionUsuariosComponent } from './gestion-usuarios/gestion-usuarios.component';

export const administracionRoutes: Routes = [
  {
    path: '',
    component: AdministracionComponent,
    children: [
      { path: '', redirectTo: 'roles', pathMatch: 'full' },
      { path: 'roles', component: GestionRolesComponent },
      { path: 'usuarios', component: GestionUsuariosComponent }
    ]
  }
];
