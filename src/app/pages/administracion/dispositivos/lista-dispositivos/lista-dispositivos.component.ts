import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { DxDataGridComponent } from 'devextreme-angular';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { DispositivosService } from 'src/app/pages/services/dispositivos.service';

@Component({
  selector: 'vex-lista-dispositivos',
  templateUrl: './lista-dispositivos.component.html',
  styleUrl: './lista-dispositivos.component.scss',
  animations: [fadeInRight400ms],
})
export class ListaDispositivosComponent {

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
  
    constructor(private disposService: DispositivosService, private alerts: AlertsService, private route:Router) {
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

  
agregarValidador(){
    this.route.navigateByUrl('/administracion/validadores/agregar-validador')
  }
}
