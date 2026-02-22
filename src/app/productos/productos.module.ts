import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ProductosComponent } from './productos.component';

const routes: Routes = [
  { path: '', component: ProductosComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ProductosComponent
  ]
})
export class ProductosModule { }

