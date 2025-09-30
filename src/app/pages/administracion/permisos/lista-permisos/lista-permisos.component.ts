import { Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { DxDataGridComponent } from 'devextreme-angular';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { PermisosService } from 'src/app/pages/services/permisos.service';

@Component({
  selector: 'vex-lista-permisos',
  templateUrl: './lista-permisos.component.html',
  styleUrl: './lista-permisos.component.scss',
  animations: [fadeInRight400ms],
})
export class ListaPermisosComponent implements OnInit {

  layoutCtrl = new UntypedFormControl('fullwidth');
  isLoading: boolean = false;
  listaPermisos: any[] = [];
  public grid: boolean = false;
  public showFilterRow: boolean;
  public showHeaderFilter: boolean;
  public loadingVisible: boolean = false;
  public mensajeAgrupar: string = "Arrastre un encabezado de columna aquí para agrupar por esa columna"
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  public autoExpandAllGroups: boolean = true;
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid!: DxDataGridComponent;
  isGrouped: boolean = false;

  constructor(private permService: PermisosService, private alerts: AlertsService, private route: Router) {
    this.showFilterRow = true;
    this.showHeaderFilter = true;
  }

  agregarPermiso(){
    this.route.navigateByUrl('/administracion/permisos/agregar-permiso')
  }

  ngOnInit(): void {
    this.ObtenerPermisos()
  }

  ObtenerPermisos() {
    this.permService.obtenerPermisos().subscribe((response) => {
      this.listaPermisos = response;
    })
  }

  limpiarCampos() {
    const today = new Date();
    this.dataGrid.instance.clearGrouping();
    this.isGrouped = false;
    this.ObtenerPermisos();
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
