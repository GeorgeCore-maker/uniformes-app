import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PedidosComponent } from './pedidos.component';

const routes: Routes = [
  { path: '', component: PedidosComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PedidosComponent
  ]
})
export class PedidosModule { }

