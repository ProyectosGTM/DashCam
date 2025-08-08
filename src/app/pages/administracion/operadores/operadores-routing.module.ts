import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OperadoresComponent } from './operadores.component';

const routes: Routes = 
[
  { path: '', component: OperadoresComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperadoresRoutingModule { }
