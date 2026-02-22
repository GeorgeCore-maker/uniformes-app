import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    AppComponent,
    BrowserAnimationsModule,
    RouterModule.forRoot([{ path: 'core', loadChildren: () => import('./core/core.module').then(m => m.CoreModule) }, { path: 'shared', loadChildren: () => import('./shared/shared.module').then(m => m.SharedModule) }, { path: 'features', loadChildren: () => import('./features/features.module').then(m => m.FeaturesModule) }, { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) }, { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) }, { path: 'clientes', loadChildren: () => import('./clientes/clientes.module').then(m => m.ClientesModule) }, { path: 'productos', loadChildren: () => import('./productos/productos.module').then(m => m.ProductosModule) }, { path: 'pedidos', loadChildren: () => import('./pedidos/pedidos.module').then(m => m.PedidosModule) }, { path: 'produccion', loadChildren: () => import('./produccion/produccion.module').then(m => m.ProduccionModule) }, { path: 'inventario', loadChildren: () => import('./inventario/inventario.module').then(m => m.InventarioModule) }])
  ],
  providers: [],
  // Removed bootstrap array as AppComponent is a standalone component
})
export class AppModule { }
