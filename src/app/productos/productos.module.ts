import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ProductosComponent } from './productos.component';

const routes: Routes = [
  { path: '', component: ProductosComponent }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    ProductosComponent
  ]
})
export class ProductosModule { }

