import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { DxDataGridComponent } from 'devextreme-angular';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { MonederosServices } from 'src/app/pages/services/monederos.service';
import { Router } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'vex-lista-monederos',
  templateUrl: './lista-monederos.component.html',
  styleUrl: './lista-monederos.component.scss',
  animations: [fadeInRight400ms],
})
export class ListaMonederosComponent implements OnInit {

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading: boolean = false;
  listaMonederos: any;
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
  public paginaActual: number = 1;
  public totalRegistros: number = 0;
  public pageSize: number = 20;
  public totalPaginas: number = 0;
  public paginaActualData: any[] = [];
  public filtroActivo: string = '';

  constructor(private dialog: MatDialog, private moneService: MonederosServices, private alerts: AlertsService, private fb: FormBuilder, private route: Router) {
    this.showFilterRow = true;
    this.showHeaderFilter = true;
  }

  ngOnInit(): void {
    this.initForm()
    this.obtenerMonederos();
  }

  obtenerMonederos() {
    this.loading = true;
    this.listaMonederos = new CustomStore({
      key: 'id',
      load: async (loadOptions: any) => {
        const take = Number(loadOptions?.take) || this.pageSize || 10;
        const skip = Number(loadOptions?.skip) || 0;
        const page = Math.floor(skip / take) + 1;
        try {
          const resp: any = await lastValueFrom(
            this.moneService.obtenerMonederosData(page, take)
          );
          this.loading = false;
          const rows: any[] = Array.isArray(resp?.data) ? resp.data : [];
          const meta = resp?.paginated || {};
          const totalRegistros =
            toNum(meta.total) ??
            toNum(resp?.total) ??
            rows.length;

          const paginaActual =
            toNum(meta.page) ??
            toNum(resp?.page) ??
            page;
          const totalPaginas =
            toNum(meta.lastPage) ??
            toNum(resp?.pages) ??
            Math.max(1, Math.ceil(totalRegistros / take));
          const dataTransformada = rows.map((item: any) => ({
            ...item,
            estatusTexto:
              item?.estatus === 1 ? 'Activo' :
                item?.estatus === 0 ? 'Inactivo' : null
          }));
          this.totalRegistros = totalRegistros;
          this.paginaActual = paginaActual;
          this.totalPaginas = totalPaginas;
          this.paginaActualData = dataTransformada;
          return {
            data: dataTransformada,
            totalCount: totalRegistros
          };
        } catch (err) {
          this.loading = false;
          console.error('Error en la solicitud de datos:', err);
          return { data: [], totalCount: 0 };
        }
      }
    });

    function toNum(v: any): number | null {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
  }

  onGridOptionChanged(e: any) {
    if (e.fullName !== 'searchPanel.text') return;
    const grid = this.dataGrid?.instance;
    const texto = (e.value ?? '').toString().trim().toLowerCase();
    if (!texto) {
      grid?.option('dataSource', this.listaMonederos);
      this.filtroActivo = '';
      return;
    }
    this.filtroActivo = texto;
    let columnas: any[] = [];
    try {
      const colsOpt = grid?.option('columns');
      if (Array.isArray(colsOpt) && colsOpt.length) columnas = colsOpt;
    } catch { }
    if (!columnas.length && grid?.getVisibleColumns) {
      columnas = grid.getVisibleColumns();
    }
    const dataFields: string[] = columnas
      .map((c: any) => c?.dataField)
      .filter((df: any) => typeof df === 'string' && df.trim().length > 0);
    const normalizar = (val: any): string => {
      if (val === null || val === undefined) return '';
      if (val instanceof Date) {
        const dd = ('0' + val.getDate()).slice(2 - 2);
        const mm = ('0' + (val.getMonth() + 1)).slice(2 - 2);
        const yyyy = val.getFullYear();
        return `${dd}/${mm}/${yyyy}`.toLowerCase();
      }
      if (typeof val === 'number') return String(val).toLowerCase();
      const s = String(val).toLowerCase();
      return s;
    };
    const dataFiltrada = (this.paginaActualData || []).filter((row: any) => {
      const hitEnColumnas = dataFields.some((df) => {
        const v = row?.[df];
        if (df.toLowerCase().includes('fecha')) {
          try {
            const d = new Date(v);
            if (!isNaN(d.getTime())) {
              const dd = ('0' + d.getDate()).slice(-2);
              const mm = ('0' + (d.getMonth() + 1)).slice(-2);
              const yyyy = d.getFullYear();
              const ddmmyyyy = `${dd}/${mm}/${yyyy}`.toLowerCase();
              if (ddmmyyyy.includes(texto)) return true;
            }
          } catch { }
        }
        return normalizar(v).includes(texto);
      });
      const extras = [
        normalizar(row?.id),
        normalizar(row?.estatusTexto)
      ];

      return hitEnColumnas || extras.some((s) => s.includes(texto));
    });
    grid?.option('dataSource', dataFiltrada);
  }

  onPageIndexChanged(e: any) {
    const pageIndex = e.component.pageIndex();
    this.paginaActual = pageIndex + 1;
    e.component.refresh();
  }


  agregarMonedero() {
    this.route.navigateByUrl('/administracion/monederos/agregar-monedero')
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
      tipoTransaccion: ['Recarga'],
      monto: [null, [Validators.required]],
      latitud: [null],
      longitud: [null],
      fechaHora: [null],
      numeroSerieMonedero: [null],
      numeroSerieDispositivo: [null],
    });

    this.debitoForm = this.fb.group({
      tipoTransaccion: ['Recarga'],
      monto: [null, [Validators.required]],
      latitud: [null],
      longitud: [null],
      fechaHora: [null],
      numeroSerieMonedero: [null],
      numeroSerieDispositivo: [null],
    });
  }

  abrirModal(tipo: 'recarga' | 'debito', raw: any) {
    this.tipoOperacion = tipo;

    const id = raw?.Id ?? raw?.id ?? null;
    const saldo = raw?.Saldo ?? raw?.saldo ?? 0;
    const numeroSerie = raw?.numeroSerie ?? raw?.NumeroSerie ?? raw?.numSerie ?? null;

    this.selectedTransaccion = { id, saldo, numSerie: numeroSerie };

    const form = tipo === 'recarga' ? this.recargaForm : this.debitoForm;
    form.reset({
      tipoTransaccion: (tipo === 'recarga') ? 'RECARGA' : 'DEBITO',
      monto: null,
      latitud: null,
      longitud: null,
      fechaHora: this.nowWithOffset(),
      numeroSerieMonedero: numeroSerie,
      numeroSerieDispositivo: null,
    });

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

    const montoVal = Number(form.get('monto')?.value);
    if (!montoVal || isNaN(montoVal) || montoVal <= 0) {
      setTimeout(() => {
        this.alerts.open({
          type: 'warning',
          title: 'Monto inválido',
          message: `Ingresa un monto mayor a 0 para ${opVerbo}.`,
          confirmText: 'Aceptar'
        });
      }, 200);
      return;
    }

    const payload = {
      tipoTransaccion: form.get('tipoTransaccion')?.value,
      monto: montoVal,
      latitud: null,
      longitud: null,
      fechaHora: form.get('fechaHora')?.value || this.nowWithOffset(),
      numeroSerieMonedero: this.selectedTransaccion?.numSerie
        ?? form.get('numeroSerieMonedero')?.value
        ?? null,
      numeroSerieDispositivo: null,
    };

    this.loading = true;
    this.submitButton = 'Cargando...';

    this.moneService.crearTransaccion(payload).subscribe({
      next: () => {
        this.loading = false;
        this.submitButton = 'Confirmar';
        this.ngOnInit();
        this.cerrarModal();
        setTimeout(() => {
          this.alerts.open({
            type: 'success',
            title: '¡Operación Exitosa!',
            message: `La ${opNombre} se realizó de manera correcta.`,
            confirmText: 'Confirmar'
          });
        }, 200);
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
        }, 200);
      }
    });
  }

  private nowWithOffset(): string {
    const d = new Date();
    const tz = d.getTimezoneOffset();
    const sign = tz > 0 ? '-' : '+';
    const local = new Date(d.getTime() - tz * 60000);
    const iso = local.toISOString().slice(0, 19);
    const hh = String(Math.floor(Math.abs(tz) / 60)).padStart(2, '0');
    const mm = String(Math.abs(tz) % 60).padStart(2, '0');
    return `${iso}${sign}${hh}:${mm}`;
  }
}
