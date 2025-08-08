import {
  AfterViewInit,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import { Observable, of, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TableColumn } from '@vex/interfaces/table-column.interface';
import {
  aioTableData,
  aioTableLabels
} from '../../../../static-data/aio-table-data';
import { CustomerCreateUpdateComponent } from '../../apps/aio-table/customer-create-update/customer-create-update.component';
import { SelectionModel } from '@angular/cdk/collections';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { stagger40ms } from '@vex/animations/stagger.animation';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl
} from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { DxDataGridModule } from 'devextreme-angular';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { BitacoraService } from '../../services/bitacora.service';
@Component({
  selector: 'vex-bitacora',
  templateUrl: './bitacora.component.html',
  styleUrl: './bitacora.component.scss',
  animations: [fadeInRight400ms],
      standalone: true,
      imports: [
        VexPageLayoutComponent,
        VexPageLayoutHeaderDirective,
        VexBreadcrumbsComponent,
        MatButtonToggleModule,
        ReactiveFormsModule,
        VexPageLayoutContentDirective,
        NgIf,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        NgFor,
        NgClass,
        MatPaginatorModule,
        FormsModule,
        MatDialogModule,
        MatInputModule,
        DxDataGridModule,
        CommonModule
      ]
})
export class BitacoraComponent implements OnInit {

  layoutCtrl = new UntypedFormControl('fullwidth');

  isLoading: boolean = false;
  bitacoraList: any[] = [];
  loading: boolean = false;
  public grid: boolean = false;
  public showFilterRow: boolean;
  public showHeaderFilter: boolean;
  public loadingVisible: boolean = false;
  public mensajeAgrupar: string = "Arrastre un encabezado de columna aquí para agrupar por esa columna"
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  constructor(private bitacoraService: BitacoraService) {
    this.showFilterRow = true;
    this.showHeaderFilter = true;
  }

  ngOnInit(): void {
    this.obtenerBitacora();
  }

  obtenerBitacora(): void {
    this.loading = true;
    this.bitacoraService.obtenerBitacora().subscribe(
      (res: any) => {
        this.bitacoraList = res.bitacora.sort((a: any, b: any) => {
          const fechaA = new Date(a.Fecha).getTime();
          const fechaB = new Date(b.Fecha).getTime();
          return fechaB - fechaA;
        });
        setTimeout(()=> {
          this.loading = false;
        },2000)
      },
      (error) => {
        console.error('Error al obtener bitácora:', error);
        this.loading = false;
      }
    );
  }

  getUserFromQuery(query: string): string {
    const match = query.match(/UserName='([^']+)'/);
    return match ? match[1] : 'Desconocido';
  }
}
