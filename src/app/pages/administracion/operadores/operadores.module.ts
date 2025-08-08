import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OperadoresRoutingModule } from './operadores-routing.module';
import { DxDataGridModule } from 'devextreme-angular';
import { OperadoresComponent } from './operadores.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OperadoresRoutingModule,
    DxDataGridModule,
    OperadoresComponent
  ]
})
export class OperadoresModule { }
