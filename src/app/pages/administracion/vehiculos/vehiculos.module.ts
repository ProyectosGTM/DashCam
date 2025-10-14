import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehiculosRoutingModule } from './vehiculos-routing.module';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';   // <-- FALTA
import { MatSelectModule } from '@angular/material/select';         // <-- FALTA
import { MatOptionModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // <-- FALTA
import { DxDataGridModule } from 'devextreme-angular';
import { ListaVehiculosComponent } from './lista-vehiculos/lista-vehiculos.component';
import { AgregarVehiculoComponent } from './agregar-vehiculo/agregar-vehiculo.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [ListaVehiculosComponent, AgregarVehiculoComponent],
  imports: [
    CommonModule,
    VehiculosRoutingModule,
    VexPageLayoutComponent,
    VexPageLayoutHeaderDirective,
    VexBreadcrumbsComponent,
    VexPageLayoutContentDirective,

    // Forms
    FormsModule,
    ReactiveFormsModule,

    // Angular Material
    MatButtonToggleModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatDialogModule,
    MatFormFieldModule,    // <-- agregado
    MatInputModule,
    MatSelectModule,       // <-- agregado
    MatOptionModule,
    MatSlideToggleModule,  // <-- agregado
    DxDataGridModule,
    MatProgressBarModule
  ]
})
export class VehiculosModule { }
