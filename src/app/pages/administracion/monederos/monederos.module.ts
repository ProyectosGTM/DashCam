import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MonederosRoutingModule } from './monederos-routing.module';
import { DxDataGridModule } from 'devextreme-angular';
import { MonederosComponent } from './monederos.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MonederosRoutingModule,
    DxDataGridModule,
    MonederosComponent,
  ]
})
export class MonederosModule { }
