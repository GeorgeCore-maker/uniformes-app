import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ClientesComponent } from './clientes.component';

const routes: Routes = [
  { path: '', component: ClientesComponent }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    ClientesComponent
  ]
})
export class ClientesModule { }

