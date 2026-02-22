import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UnauthorizedComponent } from './core/pages/unauthorized.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes',
    loadChildren: () => import('./clientes/clientes.module').then(m => m.ClientesModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'productos',
    loadChildren: () => import('./productos/productos.module').then(m => m.ProductosModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'pedidos',
    loadChildren: () => import('./pedidos/pedidos.module').then(m => m.PedidosModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'produccion',
    loadChildren: () => import('./produccion/produccion.module').then(m => m.ProduccionModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['OPERARIO', 'ADMIN'] }
  },
  {
    path: 'inventario',
    loadChildren: () => import('./inventario/inventario.module').then(m => m.InventarioModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'administracion',
    loadChildren: () => import('./administracion/administracion.routes').then(m => m.administracionRoutes),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { path: '**', redirectTo: '/auth/login' }
];
