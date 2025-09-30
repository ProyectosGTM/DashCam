import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { DxDataGridComponent } from 'devextreme-angular';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { MonederosServices } from 'src/app/pages/services/monederos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'vex-lista-monederos',
  templateUrl: './lista-monederos.component.html',
  styleUrl: './lista-monederos.component.scss',
  animations: [fadeInRight400ms],
})
export class ListaMonederosComponent implements OnInit {

  
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
  
    constructor(private dialog: MatDialog, private moneService: MonederosServices, private alerts: AlertsService, private fb: FormBuilder, private route: Router) {
      this.showFilterRow = true;
      this.showHeaderFilter = true;
    }

    agregarMonedero(){
      this.route.navigateByUrl('/administracion/monederos/agregar-monedero')
    }
  
    ngOnInit(): void {
      this.initForm()
      this.obtenerMonederos();
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
