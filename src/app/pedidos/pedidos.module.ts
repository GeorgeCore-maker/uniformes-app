import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { PedidosComponent } from './pedidos.component';

const routes: Routes = [
  { path: '', component: PedidosComponent }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    PedidosComponent
  ]
})
export class PedidosModule { }

