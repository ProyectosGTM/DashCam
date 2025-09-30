import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { DxDataGridComponent } from 'devextreme-angular';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { TransaccionesService } from 'src/app/pages/services/transacciones.service';

@Component({
  selector: 'vex-lista-transacciones',
  templateUrl: './lista-transacciones.component.html',
  styleUrl: './lista-transacciones.component.scss',
  animations: [fadeInRight400ms],
})
export class ListaTransaccionesComponent implements OnInit {

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
      private alerts: AlertsService,
      private route:Router
    ) {
      this.showFilterRow = true;
      this.showHeaderFilter = true;
    }
  
    ngOnInit(): void {
      this.obtenerTransacciones();
    }

    agregarTransaccion(){
      this.route.navigateByUrl('/administracion/transacciones/agregar-transaccion')
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
