import { Component } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'vex-generar-transaccion',
  templateUrl: './generar-transaccion.component.html',
  styleUrl: './generar-transaccion.component.scss'
})
export class GenerarTransaccionComponent {
// Paso actual
step = 1;
layoutCtrl = new UntypedFormControl('fullwidth');

// Búsqueda
query = '';

// Datos demo (reemplaza con tu API)
monederos = [
  { id: 1, numeroSerie: 'MX-001-AB', pasajero: 'Andrea López', cliente: 'Transp. Aurora', saldo: 320.50 },
  { id: 2, numeroSerie: 'MX-002-CD', pasajero: 'Luis Pérez',   cliente: 'Transp. Aurora', saldo: 150.00 },
  { id: 3, numeroSerie: 'MX-003-EF', pasajero: 'María Ruiz',   cliente: 'Logística Sol',  saldo: 980.75 },
  // ... agrega los que quieras para probar la paginación
];

monederosFiltrados = [...this.monederos];
monederosPaginados: any[] = [];
monederoSeleccionado: any = null;

// Paginación
pageIndex = 0;
pageSize = 9;

// Monto
monto = 0;       // número limpio para cálculos
montoView = '';  // string mostrado en input

ngOnInit() {
  this.aplicarPaginacion();
}

irPaso(n: 1|2) {
  this.step = n;
}

filtrarMonederos() {
  const q = (this.query || '').toLowerCase().trim();
  if (!q) {
    this.monederosFiltrados = [...this.monederos];
  } else {
    this.monederosFiltrados = this.monederos.filter(m =>
      `${m.numeroSerie} ${m.pasajero} ${m.cliente}`.toLowerCase().includes(q)
    );
  }
  this.pageIndex = 0;
  this.aplicarPaginacion();
}

onPage(e: { pageIndex: number; pageSize: number }) {
  this.pageIndex = e.pageIndex;
  this.pageSize = e.pageSize;
  this.aplicarPaginacion();
}

private aplicarPaginacion() {
  const start = this.pageIndex * this.pageSize;
  const end = start + this.pageSize;
  this.monederosPaginados = this.monederosFiltrados.slice(start, end);
}

seleccionarMonedero(m: any) {
  this.monederoSeleccionado = m;
}

private sanitizeNumber(str: string): number {
  const clean = (str || '').replace(/[^\d.]/g, '');
  const parts = clean.split('.');
  const fixed = parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('') : parts[0];
  const n = parseFloat(fixed);
  return isNaN(n) ? 0 : n;
}

onInputMonto(ev: Event) {
  const val = (ev.target as HTMLInputElement).value;
  const n = this.sanitizeNumber(val);
  this.monto = Math.max(0, n);
  this.montoView = val; // puedes formatear en blur si quieres
}

agregarMonto(v: number) {
  this.monto = (this.monto || 0) + v;
  this.montoView = this.monto.toFixed(2);
}

key(k: string) {
  if (k === '00' && this.montoView) {
    this.montoView += '00';
  } else {
    this.montoView += k;
  }
  this.monto = this.sanitizeNumber(this.montoView);
}

borrar() {
  this.montoView = (this.montoView || '').slice(0, -1);
  this.monto = this.sanitizeNumber(this.montoView);
}

confirmarRecarga() {
  if (!this.monederoSeleccionado || !this.monto || this.monto <= 0) return;
  // Conecta a tu servicio real aquí
  // this.monederoService.recargar({ id: this.monederoSeleccionado.id, monto: this.monto }).subscribe(...)
  console.log('RECARGA =>', {
    idMonedero: this.monederoSeleccionado.id,
    numeroSerie: this.monederoSeleccionado.numeroSerie,
    monto: this.monto
  });
}

cancelar() {
  this.step = 1;
  this.query = '';
  this.monto = 0;
  this.montoView = '';
  this.monederoSeleccionado = null;
  this.monederosFiltrados = [...this.monederos];
  this.pageIndex = 0;
  this.aplicarPaginacion();
}


}
