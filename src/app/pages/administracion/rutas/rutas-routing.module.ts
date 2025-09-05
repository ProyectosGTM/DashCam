import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaRutasComponent } from './lista-rutas/lista-rutas.component';

const routes: Routes = 
[
  { path: '',
    component: ListaRutasComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RutasRoutingModule { }
