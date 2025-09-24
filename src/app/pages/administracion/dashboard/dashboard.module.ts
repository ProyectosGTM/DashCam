import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { DxChartModule, DxPieChartModule, DxSparklineModule } from 'devextreme-angular';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
     DxChartModule,
    DxPieChartModule,
    DxSparklineModule,
    VexPageLayoutComponent,
        VexPageLayoutHeaderDirective,
        VexBreadcrumbsComponent,
        VexPageLayoutContentDirective,
  ]
})
export class DashboardModule { }
