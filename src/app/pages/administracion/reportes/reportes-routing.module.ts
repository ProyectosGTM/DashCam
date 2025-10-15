import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RecaudacionDiariaRutaComponent } from './recaudacion-diaria-ruta/recaudacion-diaria-ruta.component';
import { RecaudacionOperadorComponent } from './recaudacion-operador/recaudacion-operador.component';
import { RecaudacionVehiculoComponent } from './recaudacion-vehiculo/recaudacion-vehiculo.component';

const routes: Routes = [
  { 
    path: 'recaudacion-diaria-ruta',
    component:RecaudacionDiariaRutaComponent
  },
  {
    path: 'recaudacion-operador',
    component:RecaudacionOperadorComponent
  },
  {
    path: 'recaudacion-vehiculo',
    component:RecaudacionVehiculoComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportesRoutingModule { }
