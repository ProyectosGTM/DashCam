import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PasajerosRoutingModule } from './pasajeros-routing.module';
import { DxDataGridModule } from 'devextreme-angular';
import { PasajerosComponent } from './pasajeros.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    PasajerosRoutingModule,
    PasajerosComponent,
    DxDataGridModule
  ]
})
export class PasajerosModule { }
