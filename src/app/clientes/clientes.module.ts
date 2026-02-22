import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ClientesComponent } from './clientes.component';

const routes: Routes = [
  { path: '', component: ClientesComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ClientesComponent
  ]
})
export class ClientesModule { }

