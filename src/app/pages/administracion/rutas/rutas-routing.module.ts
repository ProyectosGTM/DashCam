import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaRutasComponent } from './lista-rutas/lista-rutas.component';
import { AgregarRutaComponent } from './agregar-ruta/agregar-ruta.component';

const routes: Routes = 
[
  { path: '',
    component: ListaRutasComponent
  },
  { path: 'agregar-ruta',
    component: AgregarRutaComponent
  },
  {
    path: 'editar-ruta/:idRuta',
    component: AgregarRutaComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RutasRoutingModule { }
