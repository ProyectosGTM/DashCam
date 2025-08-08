import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehiculosRoutingModule } from './vehiculos-routing.module';
import { DxDataGridModule } from 'devextreme-angular';
import { VehiculosComponent } from './vehiculos.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    VehiculosRoutingModule,
    DxDataGridModule,
    VehiculosComponent
  ]
})
export class VehiculosModule { }
