import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaOperadoresComponent } from './lista-operadores/lista-operadores.component';
import { AgregarOperadorComponent } from './agregar-operador/agregar-operador.component';

const routes: Routes = 
[
  { path: '',
    component: ListaOperadoresComponent
  },
  { path: 'agregar-operador',
    component: AgregarOperadorComponent
  },
  {
    path: 'editar-operador/:idOperador',
    component: AgregarOperadorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OperadoresRoutingModule { }
