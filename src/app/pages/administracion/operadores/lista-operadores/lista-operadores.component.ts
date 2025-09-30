import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { DxDataGridComponent } from 'devextreme-angular';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { OperadoresService } from 'src/app/pages/services/operadores.service';

@Component({
  selector: 'vex-lista-operadores',
  templateUrl: './lista-operadores.component.html',
  styleUrl: './lista-operadores.component.scss',
  animations: [fadeInRight400ms],
})
export class ListaOperadoresComponent implements OnInit {

  layoutCtrl = new UntypedFormControl('fullwidth');
  
    isLoading: boolean = false;
    listaOperadores: any[] = [];
    public grid: boolean = false;
    public showFilterRow: boolean;
    public showHeaderFilter: boolean;
    public loadingVisible: boolean = false;
    public mensajeAgrupar: string = "Arrastre un encabezado de columna aquí para agrupar por esa columna"
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    public autoExpandAllGroups: boolean = true;
    @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
    isGrouped: boolean = false;
  
    constructor(private opService: OperadoresService, private alerts: AlertsService, private route: Router) {
      this.showFilterRow = true;
      this.showHeaderFilter = true;
    }
  
    ngOnInit(): void {
      this.obtenerOperadores();
    }

    agregarOperador(){
      this.route.navigateByUrl('/administracion/operadores/agregar-operador')
    }
  
    obtenerOperadores() {
      setTimeout(() => {
        this.grid = true;
      }, 150)
      this.opService.obtenerOperadores().subscribe(
        (res: any) => {
          this.listaOperadores = res.operadores;
        },
        (error) => {
          console.error('Error al obtener operadores:', error);
          this.isLoading = false;
        }
      );
    }
  
    limpiarCampos() {
      const today = new Date();
      this.dataGrid.instance.clearGrouping();
      this.isGrouped = false;
      this.obtenerOperadores();
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
  

}
