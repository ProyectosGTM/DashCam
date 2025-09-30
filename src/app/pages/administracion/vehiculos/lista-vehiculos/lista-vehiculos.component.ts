import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { DxDataGridComponent } from 'devextreme-angular';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { VehiculosService } from 'src/app/pages/services/vehiculos.service';

@Component({
  selector: 'vex-lista-vehiculos',
  templateUrl: './lista-vehiculos.component.html',
  styleUrl: './lista-vehiculos.component.scss',
  animations: [fadeInRight400ms],
})
export class ListaVehiculosComponent implements OnInit {

  layoutCtrl = new UntypedFormControl('fullwidth');
    isLoading: boolean = false;
    listaVehiculos: any[] = [];
    public grid: boolean = false;
    public showFilterRow: boolean;
    public showHeaderFilter: boolean;
    public loadingVisible: boolean = false;
    public mensajeAgrupar: string = "Arrastre un encabezado de columna aquí para agrupar por esa columna"
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    public autoExpandAllGroups: boolean = true;
    @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
    isGrouped: boolean = false;
  
    constructor(private vehiService: VehiculosService, private alerts: AlertsService, private route:Router) {
      this.showFilterRow = true;
      this.showHeaderFilter = true;
    }
  
    ngOnInit(): void {
      this.obtenerVehiculos();
    }
  
    obtenerVehiculos() {
      setTimeout(() => {
        this.grid = true;
      }, 150)
      this.vehiService.obtenerVehiculos().subscribe(
        (res: any) => {
          if (Array.isArray(res.vehiculos)) {
            this.listaVehiculos = res.vehiculos;
          } else {
            console.error('El formato de datos recibido no es el esperado.');
          }
          this.isLoading = false;
        },
        (error) => {
          console.error('Error al obtener vehículos:', error);
          this.isLoading = false;
        }
      );
    }
  
    limpiarCampos() {
      const today = new Date();
      this.dataGrid.instance.clearGrouping();
      this.isGrouped = false;
      this.obtenerVehiculos();
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
  
  agregarVehiculo(){
    this.route.navigateByUrl('/administracion/vehiculos/agregar-vehiculo')
  }
}
