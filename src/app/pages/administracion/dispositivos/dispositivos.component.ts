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
import { NgClass, NgFor, NgIf } from '@angular/common';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { DispositivosService } from '../../services/dispositivos.service';
import Swal from 'sweetalert2';
import { AlertsService } from '../../pages/modal/alerts.service';

@Component({
  selector: 'vex-dispositivos',
  templateUrl: './dispositivos.component.html',
  styleUrl: './dispositivos.component.scss',
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
    DxDataGridModule
  ]
})
export class DispositivosComponent implements OnInit {
  layoutCtrl = new UntypedFormControl('fullwidth');
  isGrouped: boolean = false;
  isLoading: boolean = false;
  listaDispositivos: any[] = [];
  public loadingVisible: boolean = false;
  public mensajeAgrupar: string = "Arrastre un encabezado de columna aquí para agrupar por esa columna"
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public autoExpandAllGroups: boolean = true;
  @ViewChild(DxDataGridComponent, { static: false })dataGrid!: DxDataGridComponent;
  public grid: boolean = false;
  public showFilterRow: boolean;
  public showHeaderFilter: boolean;
  modalAnim: 'in' | 'out' = 'in';
  modalOpen = false;
  modalClosing = false;
  modalErrorOpen = false;
  modalErrorClosing = false;

  constructor(private disposService: DispositivosService, private alerts: AlertsService) {
    this.showFilterRow = true;
    this.showHeaderFilter = true;
  }

  ngOnInit(): void {
    this.obtenerDispositivos();
  }

  obtenerDispositivos() {
    setTimeout(() => {
      this.grid = true;
    }, 150)
    this.isLoading = true;
    this.disposService.obtenerDispositivos().subscribe(
      (res: any) => {
        if (Array.isArray(res.dispositivos)) {
          this.listaDispositivos = res.dispositivos;
        } else {
          console.error('El formato de datos recibido no es el esperado.');
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al obtener dispositivos:', error);
        this.isLoading = false;
      }
    );
  }

  limpiarCampos() {
    const today = new Date();
    this.dataGrid.instance.clearGrouping();
    this.isGrouped = false;
    this.obtenerDispositivos();
    this.dataGrid.instance.refresh();
  }

  toggleExpandGroups() {
    const groupedColumns = this.dataGrid.instance.getVisibleColumns()
      .filter(col => (col.groupIndex ?? -1) >= 0);
    if (groupedColumns.length === 0) {
      this.alerts.open({
        type: 'info',
        title: '¡Ops!',
        message: 'Debes arrastar un encabezado de una columna para expandir o contraer grupos.',
        backdropClose: false
      });
    } else {
      this.autoExpandAllGroups = !this.autoExpandAllGroups;
      this.dataGrid.instance.refresh();
    }
  }

  onBackdropError() { this.closeErrorModal(); }
  closeErrorModal() {
    this.modalErrorClosing = true;
    setTimeout(() => {
      this.modalErrorOpen = false;
      this.modalErrorClosing = false;
    }, 200);
  }

  onBackdrop() { this.closeModal(); }
  closeModal() {
    this.modalClosing = true;
    setTimeout(() => {
      this.modalOpen = false;
      this.modalClosing = false;
    }, 600);
  }

  abrirModal() {
    this.modalOpen = true;
    this.modalAnim = 'in';
  }

  cerrarModal() {
    this.modalAnim = 'out';
  }

  onAnimationEnd() {
    if (this.modalAnim === 'out') {
      this.modalOpen = false;
    }
  }
}