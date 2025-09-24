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

  rango: 'dia' | 'semana' | 'mes' = 'dia';

  // KPIs (ajusta con tus servicios)
  kpis = [
    { title: 'Recargas del día',  value: 1540.75, icon: 'bi bi-cash-coin',
      bg: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
    { title: 'Débitos del día',   value: 45200.90, icon: 'bi bi-wallet2',
      bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
    { title: 'Pasajeros',         value: 40,       icon: 'bi bi-person-check',
      bg: 'linear-gradient(135deg,#14b8a6,#0f766e)' },
    { title: 'Dispositivos',      value: 18,       icon: 'bi bi-phone',
      bg: 'linear-gradient(135deg,#16a34a,#065f46)' },
    { title: 'Unidades',          value: 25,       icon: 'bi bi-truck',
      bg: 'linear-gradient(135deg,#ef4444,#b91c1c)' },
    { title: 'Transacciones',     value: 18250,    icon: 'bi bi-arrow-left-right',
      bg: 'linear-gradient(135deg,#0ea5e9,#0f172a)' },
  ];

  // Donas
  resumenRecargasDebitos = [
    { tipo: 'Recargas', monto: 1540.75 },
    { tipo: 'Débito',   monto: 45200.90 },
  ];

  estadoDispositivos = [
    { estado: 'Conectados',    total: 15 },
    { estado: 'Desconectados', total: 3 },
  ];

  entradasSalidas = [
    { tipo: 'Entradas', total: 40 },
    { tipo: 'Salidas',  total: 25 },
  ];

  // Barras
  txPorDia = this.genDias(7).map((d, i) => ({ d, v: [28, 31, 26, 34, 29, 33, 36][i] }));

  // Cambiar rango (ejemplo simple)
  setRango(r: 'dia'|'semana'|'mes') {
    this.rango = r;
    // Aquí ajustarías los datasets según tu API.
    // Por simplicidad, solo cambio ligeros valores.
    if (r === 'dia') {
      this.resumenRecargasDebitos = [
        { tipo: 'Recargas', monto: 1540.75 },
        { tipo: 'Débito',   monto: 45200.90 },
      ];
      this.entradasSalidas = [
        { tipo: 'Entradas', total: 40 },
        { tipo: 'Salidas',  total: 25 },
      ];
    } else if (r === 'semana') {
      this.resumenRecargasDebitos = [
        { tipo: 'Recargas', monto: 9850.40 },
        { tipo: 'Débito',   monto: 189500.00 },
      ];
      this.entradasSalidas = [
        { tipo: 'Entradas', total: 260 },
        { tipo: 'Salidas',  total: 210 },
      ];
    } else {
      this.resumenRecargasDebitos = [
        { tipo: 'Recargas', monto: 41250.10 },
        { tipo: 'Débito',   monto: 812300.00 },
      ];
      this.entradasSalidas = [
        { tipo: 'Entradas', total: 1120 },
        { tipo: 'Salidas',  total: 980 },
      ];
    }
  }

  // Actividad
  actividad = [
    { fecha: '10 Jun, 2025 — 09:15 am', texto: 'Inicio de sesión en Dashboard por admin.' },
    { fecha: '09 Jun, 2025 — 04:42 pm', texto: 'Se registró un nuevo Monedero.' },
    { fecha: '08 Jun, 2025 — 11:00 am', texto: 'Inicio de sesión desde el módulo Dashboard.' },
    { fecha: '07 Jun, 2025 — 06:32 pm', texto: 'Se creó una nueva Ruta.' },
  ];

  // Helpers
  private genDias(n: number): string[] {
    const out: string[] = [];
    const base = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const x = new Date(base);
      x.setDate(base.getDate() - i);
      out.push(x.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }));
    }
    return out;
  }

  // Botón “lista” demo
  rotarTipo(_: 'rd'|'disp') { /* opcional: abrir menú */ }
}
