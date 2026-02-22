import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { SharedComponent } from './shared.component';


const routes: Routes = [
  { path: '', component: SharedComponent }
];

@NgModule({
  declarations: [
    SharedComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    CommonModule,
    RouterModule
  ]
})
export class SharedModule { }
