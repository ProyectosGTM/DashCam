import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DispositivosRoutingModule } from './dispositivos-routing.module';
import { DispositivosComponent } from './dispositivos.component';
import { DxDataGridModule } from 'devextreme-angular';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    DispositivosComponent,
    DispositivosRoutingModule,
    DxDataGridModule
  ]
})
export class DispositivosModule { }
