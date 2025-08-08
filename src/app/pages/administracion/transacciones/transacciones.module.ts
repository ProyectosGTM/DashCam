import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransaccionesRoutingModule } from './transacciones-routing.module';
import { DxDataGridModule } from 'devextreme-angular';
import { TransaccionesComponent } from './transacciones.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    TransaccionesRoutingModule,
    DxDataGridModule,
    TransaccionesComponent
  ]
})
export class TransaccionesModule { }
