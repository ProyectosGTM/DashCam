import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { MonederosServices } from 'src/app/pages/services/monederos.service';
import { TransaccionesService } from 'src/app/pages/services/transacciones.service';

@Component({
  selector: 'vex-generar-transaccion',
  templateUrl: './generar-transaccion.component.html',
  styleUrl: './generar-transaccion.component.scss',
  animations: [fadeInRight400ms],
})
export class GenerarTransaccionComponent implements OnInit {
  // Paso actual
  step = 1;
  layoutCtrl = new UntypedFormControl('fullwidth');

  // Búsqueda
  query = '';

  // Datos demo (reemplaza con tu API)
  monederos = [
    { id: 1, numeroSerie: 'MX-001-AB', pasajero: 'Andrea López', cliente: 'Transp. Aurora', saldo: 320.50 },
    { id: 2, numeroSerie: 'MX-002-CD', pasajero: 'Luis Pérez', cliente: 'Transp. Aurora', saldo: 150.00 },
    { id: 3, numeroSerie: 'MX-003-EF', pasajero: 'María Ruiz', cliente: 'Logística Sol', saldo: 980.75 },
    // ... agrega los que quieras para probar la paginación
  ];

  monederosFiltrados = [...this.monederos];
  monederosPaginados: any[] = [];

  // Paginación
  pageIndex = 0;
  pageSize = 9;

  // Monto
  monto = 0;       // número limpio para cálculos
  montoView = '';  // string mostrado en input


  constructor(
    private moneService: MonederosServices,
    private transaccionService: TransaccionesService,
    private alerts: AlertsService,
    private route: Router
  ) {
  }
  
  ngOnInit() {
    this.aplicarPaginacion();
    this.obtenerMonederos()
  }

  irPaso(n: 1 | 2) {
    this.step = n;
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

  cargando = false;

  private toLocalISOString(d = new Date()): string {
    const pad = (n: number) => String(Math.trunc(Math.abs(n))).padStart(2, '0');
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    const offsetMin = -d.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const offH = pad(Math.trunc(Math.abs(offsetMin) / 60));
    const offM = pad(Math.trunc(Math.abs(offsetMin) % 60));
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${sign}${offH}:${offM}`;
  }

  private getNumeroSerieMonedero(): string {
    return this.monederoSeleccionado?.numeroSerie
      || this.monederoSeleccionado?.serie
      || '';
  }


  confirmarRecarga() {
    // Evita doble clic
    if (this.cargando) return;

    // Validaciones mínimas
    if (!this.monederoSeleccionado || !this.monto || this.monto <= 0) return;

    const payload = {
      tipoTransaccion: 'RECARGA',
      monto: Number(this.monto),
      latitud: null,
      longitud: null,
      fechaHora: this.toLocalISOString(),        // hora local con offset
      numeroSerieMonedero: this.getNumeroSerieMonedero(),
      numeroSerieValidador: null
    };

    console.log('Payload a enviar:', payload);
    this.agregar(payload); // ← ahora sí lo enviamos al servicio
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

  public listaMonederos: any[] = [];
  public listaMonederosFiltrados: any[] = [];
  monederoSeleccionado: any = null;

  // Llama esto en ngOnInit()
  obtenerMonederos() {
    this.moneService.obtenerMonederos().subscribe((response) => {
      this.listaMonederos = response?.data ?? [];
      this.listaMonederosFiltrados = [...this.listaMonederos]; // base para el buscador
    });
  }

  filtrarMonederos() {
    const q = (this.query || '').toLowerCase().trim();
    if (!q) {
      this.listaMonederosFiltrados = [...this.listaMonederos];
    } else {
      this.listaMonederosFiltrados = this.listaMonederos.filter(m =>
        `${m.numeroSerie || m.serie || ''} ${m.nombreCompletoPasajero || ''} ${m.clienteNombre || m.nombreCompletoCliente || ''}`
          .toLowerCase()
          .includes(q)
      );
    }
  }

  regresar() {
    this.route.navigateByUrl('/administracion/transacciones')
  }

  agregar(payload: any) {
    this.cargando = true;
    this.transaccionService.agregarTransaccion(payload).subscribe(
      (_response: any) => {
        this.alerts.open({
          type: 'success',
          title: '¡Operación Exitosa!',
          message: 'Se agregó una nueva transacción de manera exitosa.',
          confirmText: 'Confirmar',
          backdropClose: false,
        });
        this.cargando = false;
        this.regresar();
      },
      (_error: any) => {
        this.alerts.open({
          type: 'error',
          title: '¡Ops!',
          message: 'Ocurrió un error al agregar la transacción.',
          confirmText: 'Confirmar',
          backdropClose: false,
        });
        this.cargando = false;
      }
    );
  }

}