import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { DxDataGridComponent } from 'devextreme-angular';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { PasajerosService } from 'src/app/pages/services/pasajeros.service';

@Component({
  selector: 'vex-lista-pasajeros',
  templateUrl: './lista-pasajeros.component.html',
  styleUrl: './lista-pasajeros.component.scss',
  animations: [fadeInRight400ms],
})
export class ListaPasajerosComponent implements OnInit {

  
    layoutCtrl = new UntypedFormControl('fullwidth');
  
    isLoading: boolean = false;
    loading: boolean = false;
    listaPasajeros: any[] = [];
    public grid: boolean = false;
    public showFilterRow: boolean;
    public showHeaderFilter: boolean;
    public loadingVisible: boolean = false;
    public mensajeAgrupar: string = "Arrastre un encabezado de columna aquí para agrupar por esa columna"
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    public autoExpandAllGroups: boolean = true;
    @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
    isGrouped: boolean = false;
  
    constructor(private pasaService: PasajerosService, private route:Router, private alerts: AlertsService) {
      this.showFilterRow = true;
      this.showHeaderFilter = true;
     }
  
    ngOnInit(): void {
      this.obtenerListaPasajeros();
    }
    
    agregarPasajero(){
      this.route.navigateByUrl('/administracion/pasajeros/agregar-pasajero')
    }
  
    obtenerListaPasajeros() {
      this.loading = true;
      this.pasaService.obtenerPasajeros().subscribe(
        (res: any) => {
          setTimeout(()=> {
            this.loading = false;
          },2000)
          this.listaPasajeros = res.pasajeros.sort((a: any, b: any) => b.Id - a.Id);
        },
        (error) => {
          console.error('Error al obtener pasajeros:', error);
          this.loading = false;
        }
      );
    }
  
    limpiarCampos() {
      const today = new Date();
      this.dataGrid.instance.clearGrouping();
      this.isGrouped = false;
      this.obtenerListaPasajeros();
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
