import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { InventarioComponent } from './inventario.component';

const routes: Routes = [
  { path: '', component: InventarioComponent }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    InventarioComponent
  ]
})
export class InventarioModule { }
