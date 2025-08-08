import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MonederosComponent } from './monederos.component';

const routes: Routes = 
[
  { path: '', component: MonederosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MonederosRoutingModule { }
