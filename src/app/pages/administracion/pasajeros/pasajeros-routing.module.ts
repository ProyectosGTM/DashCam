import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PasajerosComponent } from './pasajeros.component';

const routes: Routes = 
[
  { path: '', component: PasajerosComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PasajerosRoutingModule { }
