import {
  Component,
  OnInit,
  ViewChild,
  DestroyRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';

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
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';

import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';

import { TransaccionesService } from '../../services/transacciones.service';
import { AlertsService } from '../../pages/modal/alerts.service';

declare const google: any;

@Component({
  selector: 'vex-transacciones',
  templateUrl: './transacciones.component.html',
  styleUrl: './transacciones.component.scss',
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
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginatorModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    DxDataGridModule
  ]
})
export class TransaccionesComponent implements OnInit {

  layoutCtrl = new UntypedFormControl('fullwidth');

  isLoading = false;
  loading = false;
  listaTransacciones: any[] = [];
  public grid = false;
  public showFilterRow: boolean;
  public showHeaderFilter: boolean;
  public loadingVisible = false;
  public mensajeAgrupar = 'Arrastre un encabezado de columna aquí para agrupar por esa columna';
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public autoExpandAllGroups = true;
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  isGrouped = false;

  modalAnim: 'in' | 'out' = 'in';
  modalOpen = false;
  modalClosing = false;
  modalErrorOpen = false;
  modalErrorClosing = false;
  selectedTransaccion: any = null;
  private readonly MAP_ID = 'DEMO_MAP_ID';

  constructor(
    private tranService: TransaccionesService,
    private alerts: AlertsService
  ) {
    this.showFilterRow = true;
    this.showHeaderFilter = true;
  }

  ngOnInit(): void {
    this.obtenerTransacciones();
  }

  obtenerTransacciones() {
    this.loading = true;
    this.tranService.obtenerTransacciones().subscribe(
      (res: any) => {
        setTimeout(() => (this.loading = false), 800);
        this.listaTransacciones = res?.transacciones ?? [];
      },
      (error) => {
        console.error('Error al obtener transacciones:', error);
        this.loading = false;
      }
    );
  }

  limpiarCampos() {
    this.dataGrid.instance.clearGrouping();
    this.isGrouped = false;
    this.obtenerTransacciones();
    this.dataGrid.instance.refresh();
  }

  toggleExpandGroups() {
    const groupedColumns = this.dataGrid.instance
      .getVisibleColumns()
      .filter((col) => (col.groupIndex ?? -1) >= 0);

    if (groupedColumns.length === 0) {
      this.alerts.open({
        type: 'info',
        title: '¡Ops!',
        message: 'Debes arrastrar un encabezado de una columna para expandir o contraer grupos.',
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

  cerrarModal() {
    this.modalAnim = 'out';
    setTimeout(() => {
      this.modalOpen = false;
      this.selectedTransaccion = null;
    }, 220);
  }

  cerrarModalPorBackdrop(_event: MouseEvent) { this.cerrarModal(); }
  accionPrincipal() { this.cerrarModal(); }

  onAnimationEnd() {
    if (this.modalAnim === 'out') {
      this.modalOpen = false;
    }
  }

  async abrirModal(raw: any) {
    const id = raw?.Id ?? raw?.id ?? null;
    const latStr = String(raw?.Latitud ?? raw?.latitud ?? '');
    const lngStr = String(raw?.Longitud ?? raw?.longitud ?? '');
    const tipo = raw?.TipoTransaccion ?? raw?.tipo ?? null;
    const fecha = raw?.FechaHora ? new Date(raw.FechaHora) : null;
    const montoNum = typeof raw?.Monto === 'number'
      ? raw.Monto
      : Number((raw?.Monto ?? '0').toString().replace(/[^0-9.-]/g, '')) || 0;

    console.log('ID de la transacción:', id);

    this.selectedTransaccion = { id, fecha, tipo, monto: montoNum, lat: latStr, lng: lngStr };

    this.modalOpen = true;
    this.modalAnim = 'in';

    await this.waitForGoogleMaps();
    setTimeout(() => this.initializeMap(latStr, lngStr), 120);
  }

  private waitForGoogleMaps(): Promise<void> {
    if ((window as any).google?.maps) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        if ((window as any).google?.maps) return resolve();
        if (Date.now() - start > 8000) return reject('Google Maps no cargó');
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  private initializeMap(lat: string, lng: string): void {
    const el = document.getElementById('map');
    if (!el) return;

    el.innerHTML = '';

    const position = {
      lat: Number.parseFloat(lat || '0'),
      lng: Number.parseFloat(lng || '0')
    };
    if (Number.isNaN(position.lat) || Number.isNaN(position.lng)) return;

    const options: any = {
      center: position,
      zoom: 15
    };
    if (this.MAP_ID) options.mapId = this.MAP_ID;

    const map = new google.maps.Map(el, options);

    const Advanced = google.maps?.marker?.AdvancedMarkerElement;

    const canUseAdvanced = Boolean(this.MAP_ID) && Boolean(Advanced);

    if (canUseAdvanced) {
      new Advanced({
        map,
        position,
        title: `Transacción ${this.selectedTransaccion?.id ?? ''}`
      });
    } else {
      new google.maps.Marker({
        map,
        position,
        title: `Transacción ${this.selectedTransaccion?.id ?? ''}`
      });
    }
  }
}
