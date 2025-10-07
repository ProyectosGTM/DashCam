import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

type TrendPoint = { d: string; v: number };

@Component({
  selector: 'vex-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DashboardComponent {

  layoutCtrl = new UntypedFormControl('fullwidth');

  monederosResumen = [
    { tipo: 'Recargas', total: 85000 },
    { tipo: 'Débitos', total: 54000 },
  ];

  vehiculosEstatus = [
    { estatus: 'Instalados', total: 38 },
    { estatus: 'Libres', total: 12 },
  ];

  transaccionesMes = [
    { mes: 'Ene', recargas: 12500, debitos: 9600 },
    { mes: 'Feb', recargas: 14300, debitos: 10200 },
    { mes: 'Mar', recargas: 15800, debitos: 9800 },
    { mes: 'Abr', recargas: 13400, debitos: 9100 },
    { mes: 'May', recargas: 16500, debitos: 11200 },
    { mes: 'Jun', recargas: 17100, debitos: 10800 },
    { mes: 'Jul', recargas: 18000, debitos: 11500 },
  ];

  customizeTooltip(arg: any) {
    return {
      text: `${arg.argumentText}: $${arg.valueText}`
    };
  }

  kpi = {
    usuariosActivos: 58,
    totalUsuarios: 72,

    monederosConSaldo: 420,
    porcentajeConSaldo: 76,

    vehiculosInstalados: 38,
    vehiculosLibres: 12,

    hoy: {
      recargas: 21500,
      debitos: 13400
    }
  };

  ultimasTransacciones = [
  { usuario: 'Carlos Pérez', tipo: 'Recarga', monto: 250, fecha: '07/10/2025', estatus: 'Completada' },
  { usuario: 'Ana López', tipo: 'Débito', monto: 120, fecha: '07/10/2025', estatus: 'Completada' },
  { usuario: 'Luis Ramírez', tipo: 'Recarga', monto: 350, fecha: '06/10/2025', estatus: 'Pendiente' },
  { usuario: 'María Torres', tipo: 'Débito', monto: 90, fecha: '06/10/2025', estatus: 'Completada' },
  { usuario: 'Eduardo Vega', tipo: 'Recarga', monto: 200, fecha: '05/10/2025', estatus: 'Completada' },
  { usuario: 'Rocío Méndez', tipo: 'Débito', monto: 150, fecha: '05/10/2025', estatus: 'Fallida' },
  { usuario: 'José Ortega', tipo: 'Recarga', monto: 100, fecha: '04/10/2025', estatus: 'Completada' },
  { usuario: 'Diana Herrera', tipo: 'Débito', monto: 75, fecha: '04/10/2025', estatus: 'Completada' },
  { usuario: 'Fernando Ruiz', tipo: 'Recarga', monto: 500, fecha: '03/10/2025', estatus: 'Pendiente' },
  { usuario: 'Andrea Soto', tipo: 'Débito', monto: 180, fecha: '03/10/2025', estatus: 'Completada' },
];

}