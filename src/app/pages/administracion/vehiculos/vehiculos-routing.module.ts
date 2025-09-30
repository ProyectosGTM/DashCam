import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaVehiculosComponent } from './lista-vehiculos/lista-vehiculos.component';
import { AgregarVehiculoComponent } from './agregar-vehiculo/agregar-vehiculo.component';

const routes: Routes = 
[
  { path: '',
    component: ListaVehiculosComponent
  },
  { path: 'agregar-vehiculo',
    component: AgregarVehiculoComponent
  },
  {
    path: 'editar-vehiculo/:idVehiculo',
    component: AgregarVehiculoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehiculosRoutingModule { }
