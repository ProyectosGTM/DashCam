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
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormControl,
  Validators
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
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { RealizarRecargaComponent } from './realizar-recarga/realizar-recarga.component';
import { MonederosServices } from '../../services/monederos.service';
import { AlertsService } from '../../pages/modal/alerts.service';
@Component({
  selector: 'vex-monederos',
  templateUrl: './monederos.component.html',
  styleUrl: './monederos.component.scss',
  animations: [fadeInRight400ms],
  standalone: true,
  imports: [
    CommonModule,
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
    NgClass,
    MatPaginatorModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    DxDataGridModule
  ]
})
export class MonederosComponent implements OnInit {

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading: boolean = false;
  listaMonederos: any[] = [];
  public grid: boolean = false;
  public showFilterRow: boolean;
  public showHeaderFilter: boolean;
  public loadingVisible: boolean = false;
  public mensajeAgrupar: string = "Arrastre un encabezado de columna aquí para agrupar por esa columna"
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public autoExpandAllGroups: boolean = true;
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  isGrouped: boolean = false;
  modalClosing = false;
  modalErrorOpen = false;
  modalErrorClosing = false;
  public recargaForm!: FormGroup;
  public debitoForm!: FormGroup;
  modalOpen = false;
  modalAnim: 'in' | 'out' | '' = '';
  tipoOperacion: 'recarga' | 'debito' = 'recarga';
  selectedTransaccion: { id: any; saldo: number | string; numSerie: string } | null = null;
  montoIngresado: number | null = null;
  submitButton = 'Confirmar';
  loading = false;

  constructor(private dialog: MatDialog, private moneService: MonederosServices, private alerts: AlertsService, private fb: FormBuilder) {
    this.showFilterRow = true;
    this.showHeaderFilter = true;
  }

  ngOnInit(): void {
    this.initForm()
    this.obtenerMonederos();
  }

  createCustomer() {
    this.dialog
      .open(RealizarRecargaComponent)
      .afterClosed()
  }

  obtenerMonederos() {
    setTimeout(() => {
      this.grid = true;
    }, 150)
    this.moneService.obtenerMonederos().subscribe(
      (res: any) => {
        this.listaMonederos = res.monederos;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error al obtener monederos:', error);
        this.isLoading = false;
      }
    );
  }

  limpiarCampos() {
    const today = new Date();
    this.dataGrid.instance.clearGrouping();
    this.isGrouped = false;
    this.obtenerMonederos();
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

  initForm() {
    this.recargaForm = this.fb.group({
      IdMonedero: [null],
      Monto: [null, [Validators.required]],
      TipoTransaccion: ['Recarga'],
      Latitud: [19.4326],
      Longitud: [-99.1332]
    });

    this.debitoForm = this.fb.group({
      IdMonedero: [null],
      Monto: [null, [Validators.required]],
      TipoTransaccion: ['Debito'],
      Latitud: [19.4326],
      Longitud: [-99.1332]
    });
  }

  abrirModal(tipo: 'recarga' | 'debito', raw: any) {
    this.tipoOperacion = tipo;
    const id = raw?.Id ?? raw?.id ?? null;
    const saldo = raw?.Saldo ?? raw?.saldo ?? 0;
    const numSerie = raw?.NumeroSerie ?? raw?.numeroSerie ?? raw?.numSerie ?? '';
    this.selectedTransaccion = { id, saldo, numSerie };
    this.modalOpen = true;
    this.modalAnim = 'in';
    this.modalClosing = false;
  }

  cerrarModal() {
    this.modalClosing = true;
    this.modalAnim = 'out';
    setTimeout(() => {
      this.modalOpen = false;
      this.modalClosing = false;
      this.modalAnim = '';
      this.montoIngresado = null;
    }, 300);
  }

  onAnimationEnd() {
    if (this.modalAnim === 'out') {
      this.modalOpen = false;
    }
  }

  confirmarOperacion() {
    const form = this.tipoOperacion === 'recarga' ? this.recargaForm : this.debitoForm;
    const opNombre = this.tipoOperacion === 'recarga' ? 'Recarga' : 'Débito';
    const opVerbo = this.tipoOperacion === 'recarga' ? 'recargar' : 'debitar';

    form.patchValue({
      IdMonedero: this.selectedTransaccion?.id ?? form.value.IdMonedero,
      TipoTransaccion: this.tipoOperacion === 'recarga' ? 'Recarga' : 'Debito'
    });

    if (form.invalid || (form.value.Monto ?? 0) <= 0) {
      setTimeout(() => {
        this.alerts.open({
          type: 'warning',
          title: 'Monto inválido',
          message: `Ingresa un monto mayor a 0 para ${opVerbo}.`,
          confirmText: 'Aceptar'
        });
      }, 500);
      return;
    }

    this.loading = true;
    this.submitButton = 'Cargando...';
    this.moneService.crearTransaccion(form.value).subscribe({
      next: (response: any) => {
        this.loading = false;
        this.submitButton = 'Confirmar';
        this.ngOnInit();
        if (response) {
          this.cerrarModal();
          setTimeout(() => {
            this.alerts.open({
              type: 'success',
              title: '¡Operación Exitosa!',
              message: `La ${opNombre} se realizó de manera correcta.`,
              confirmText: 'Confirmar'
            });
          }, 500);
        } else {
          setTimeout(() => {
            this.alerts.open({
              type: 'warning',
              title: `${opNombre} no confirmada`,
              message: 'El servicio respondió de forma inesperada.',
              confirmText: 'Entendido'
            });
          }, 500);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.submitButton = 'Confirmar';
        setTimeout(() => {
          this.alerts.open({
            type: 'error',
            title: `Error al ${opVerbo}`,
            message: (err?.message || err?.error?.message) ?? `Ocurrió un error al ${opVerbo}.`,
            confirmText: 'Aceptar'
          });
        }, 500);
      }
    });
  }

}