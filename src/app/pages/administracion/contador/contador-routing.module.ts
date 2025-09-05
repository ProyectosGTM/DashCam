import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaContadoraComponent } from './lista-contadora/lista-contadora.component';

const routes: Routes = 
[
  { 
    path: '',
    component:ListaContadoraComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContadorRoutingModule { }
