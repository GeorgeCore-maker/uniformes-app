import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { ProduccionComponent } from './produccion.component';

const routes: Routes = [
  { path: '', component: ProduccionComponent }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    ProduccionComponent
  ]
})
export class ProduccionModule { }
