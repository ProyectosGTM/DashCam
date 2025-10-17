import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { DispositivosService } from 'src/app/pages/services/dispositivos.service';
import { MonederosServices } from 'src/app/pages/services/monederos.service';
import { TransaccionesService } from 'src/app/pages/services/transacciones.service';

@Component({
  selector: 'vex-agregar-transaccion',
  templateUrl: './agregar-transaccion.component.html',
  styleUrl: './agregar-transaccion.component.scss'
})
export class AgregarTransaccionComponent implements OnInit {


  layoutCtrl = new UntypedFormControl('fullwidth');
  public submitButton: string = 'Guardar';
  public loading: boolean = false;
  public listaModulos: any;
  public transaccionForm!: FormGroup;
  public title = 'Generar Transacción';
  public listaDispositivos: any;
  public listaMonederos: any;
  selectedFileName: string = '';
  previewUrl: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private transaccionService: TransaccionesService,
    private dispService: DispositivosService,
    private moneService: MonederosServices,
    private zone: NgZone,
    private alerts: AlertsService,
  ) { }

  ngOnInit(): void {
    this.obtenerDispositivos();
    this.obtenerMonederos();
    this.initForm();
  }

  initForm() {
    this.transaccionForm = this.fb.group({
      tipoTransaccion: [null, Validators.required],
      monto: [null, [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      latitud: [null],
      longitud: [null],
      fechaHora: [null, Validators.required],
      numeroSerieMonedero: ['', Validators.required],
      numeroSerieValidador: [null, Validators.required],
    });

    // setea la hora actual local en el input datetime-local
    this.transaccionForm.patchValue({ fechaHora: this.nowForDatetimeLocal() });
  }


  toDatetimeLocal(isoZ: string | null): string {
    if (!isoZ) return '';
    const d = new Date(isoZ);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 16);
  }

  toIsoZulu(localStr: string | null): string | null {
    if (!localStr) return null;
    return new Date(localStr).toISOString().replace(/\.\d{3}Z$/, 'Z');
  }

  submit() {
    this.submitButton = 'Cargando...';
    this.loading = true;
    // console.log(this.transaccionForm.value)
    this.agregar();
  }

  obtenerDispositivos() {
    this.dispService.obtenerDispositivos().subscribe((response) => {
      // Normaliza para que SIEMPRE exista d.numeroSerie
      this.listaDispositivos = (response?.data || []).map((d: any) => ({
        ...d,
        numeroSerie: d?.numeroSerie ?? d?.NumeroSerie ?? d?.numSerie ?? d?.serie ?? null,
      }));
    });
  }


  obtenerMonederos() {
    this.moneService.obtenerMonederos().subscribe((response) => {
      this.listaMonederos = response.data
    })
  }

  async agregar() {
    this.submitButton = 'Cargando...';
    this.loading = true;

    const etiquetas: Record<string, string> = {
      tipoTransaccion: 'Tipo de Transacción',
      monto: 'Monto',
      fechaHora: 'Fecha y Hora',
      numeroSerieMonedero: 'N° de Serie de Monedero',
      numeroSerieValidador: 'N° de Serie de Validador'
    };

    if (this.transaccionForm.invalid) {
      this.submitButton = 'Guardar';
      this.loading = false;

      const camposFaltantes: string[] = [];
      Object.keys(this.transaccionForm.controls).forEach((key) => {
        const control = this.transaccionForm.get(key);
        if (control?.errors?.['required']) {
          camposFaltantes.push(etiquetas[key] || key);
        }
      });

      const lista = camposFaltantes.map((campo, index) => `
      <div style="padding: 8px 12px; border-left: 4px solid #d9534f;
                  background: #caa8a8; text-align: center; margin-bottom: 8px;
                  border-radius: 4px;">
        <strong style="color: #b02a37;">${index + 1}. ${campo}</strong>
      </div>
    `).join('');

      await this.alerts.open({
        type: 'warning',
        title: '¡Ops!',
        message: `
        <p style="text-align: center; font-size: 15px; margin-bottom: 16px; color: white">
          Los siguientes <strong>campos obligatorios</strong> están vacíos.<br>
        </p>
        <div style="max-height: 350px; overflow-y: auto;">${lista}</div>
      `,
        confirmText: 'Entendido',
        backdropClose: false,
      });
      return;
    }

    const toNumber6 = (v: any): number | null => {
      if (v === null || v === undefined || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) ? Number(n.toFixed(6)) : null;
    };

    const raw = this.transaccionForm.value;

    const payload = {
      // camelCase exacto:
      tipoTransaccion: (raw?.tipoTransaccion || '').toString().toUpperCase() || null, // 'RECARGA' | 'DEBITO'
      monto: (() => {
        if (raw?.monto === '' || raw?.monto == null) return null;
        const n = Number(parseFloat(String(raw.monto).toString().replace(',', '.')).toFixed(2));
        return isNaN(n) ? null : n;
      })(),
      latitud: toNumber6(raw?.latitud),                    // puede ir null
      longitud: toNumber6(raw?.longitud),                  // puede ir null
      fechaHora: this.localDatetimeToOffsetISO(raw?.fechaHora || null), // <-- HORA LOCAL CON OFFSET
      numeroSerieMonedero: raw?.numeroSerieMonedero ?? null,
      numeroSerieValidador: raw?.numeroSerieValidador ?? null,
    };

    if (this.transaccionForm.contains('id')) {
      this.transaccionForm.removeControl('id');
    }

    this.transaccionService.agregarTransaccion(payload).subscribe(
      (response: any) => {
        this.submitButton = 'Guardar';
        this.loading = false;
        this.alerts.open({
          type: 'success',
          title: '¡Operación Exitosa!',
          message: 'Se agregó una nueva transacción de manera exitosa.',
          confirmText: 'Confirmar',
          backdropClose: false,
        });
        this.regresar();
      },
      (_error: any) => {
        this.submitButton = 'Guardar';
        this.loading = false;
        this.alerts.open({
          type: 'error',
          title: '¡Ops!',
          message: 'Ocurrió un error al agregar la transacción.',
          confirmText: 'Confirmar',
          backdropClose: false,
        });
      }
    );
  }


  moneyKeydown(e: KeyboardEvent) {
    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    if (allowed.includes(e.key)) return;

    const input = e.target as HTMLInputElement;
    const value = input.value || '';

    if (e.key === '.') {
      if (value.includes('.')) e.preventDefault();
      return;
    }
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    const selStart = input.selectionStart ?? value.length;
    const selEnd = input.selectionEnd ?? value.length;
    const newValue = value.slice(0, selStart) + e.key + value.slice(selEnd);
    const parts = newValue.split('.');
    if (parts[1] && parts[1].length > 2) e.preventDefault();
  }

  moneyInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let v = (input.value || '').replace(',', '.');
    v = v.replace(/[^0-9.]/g, '');
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      const before = v.slice(0, firstDot + 1);
      const after = v.slice(firstDot + 1).replace(/\./g, '');
      v = before + after;
    }
    const parts = v.split('.');
    if (parts[1]) v = parts[0] + '.' + parts[1].slice(0, 2);

    input.value = v;
    this.transaccionForm.get('monto')?.setValue(v, { emitEvent: false });
  }

  moneyPaste(e: ClipboardEvent) {
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    const text = (e.clipboardData?.getData('text') || '').replace(',', '.');
    let v = text.replace(/[^0-9.]/g, '');
    const firstDot = v.indexOf('.');
    if (firstDot !== -1) {
      const before = v.slice(0, firstDot + 1);
      const after = v.slice(firstDot + 1).replace(/\./g, '');
      v = before + after;
    }
    const parts = v.split('.');
    if (parts[1]) v = parts[0] + '.' + parts[1].slice(0, 2);
    input.value = v;
    this.transaccionForm.get('monto')?.setValue(v, { emitEvent: false });
  }

  moneyBlur(e: FocusEvent) {
    const input = e.target as HTMLInputElement;
    let v = input.value;

    if (!v) return;
    if (/^\d+$/.test(v)) {
      v = v + '.00';
    } else if (/^\d+\.\d$/.test(v)) {
      v = v + '0';
    } else if (/^\d+\.\d{2}$/.test(v)) {
    } else {
      v = v.replace(',', '.').replace(/[^0-9.]/g, '');
      const parts = v.split('.');
      v = parts[0] + (parts[1] ? '.' + parts[1].slice(0, 2) : '.00');
      if (/^\d+$/.test(v)) v = v + '.00';
      if (/^\d+\.\d$/.test(v)) v = v + '0';
    }
    input.value = v;
    this.transaccionForm.get('monto')?.setValue(v, { emitEvent: false });
  }


  lat: number | null = null;
  lng: number | null = null;
  private map!: any;
  private marker!: any;
  private infoWindow!: any;
  private geocoder!: any;

  async ngAfterViewInit(): Promise<void> {
    await this.loadGoogleMaps('AIzaSyBpLS8xONczrVarb5aZz-mXj1hBMLxhQpU');
    this.initMap();
  }

  private initMap(): void {
    const center = { lat: 19.2840, lng: -99.6550 };
    const el = document.getElementById('map') as HTMLElement;
    this.map = new google.maps.Map(el, { center, zoom: 14 });
    this.geocoder = new google.maps.Geocoder();
    this.infoWindow = new google.maps.InfoWindow();
    this.map.addListener('click', (e: any) => {
      this.zone.run(() => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        this.lat = lat;
        this.lng = lng;
        this.transaccionForm.patchValue({ latitud: lat, longitud: lng });
        this.placeMarker(e.latLng);
        this.openInfoAt(e.latLng);
      });
    });
  }

  private openInfoAt(latLng: any): void {
    this.geocoder.geocode({ location: latLng }, (results: any, status: string) => {
      let address =
        status === 'OK' && results && results[0]?.formatted_address
          ? results[0].formatted_address
          : `Lat: ${latLng.lat().toFixed(6)}, Lng: ${latLng.lng().toFixed(6)}`;

      const html = `
      <div style="font-family: 'Segoe UI', sans-serif; border-radius: 12px; max-width: 250px; word-wrap: break-word; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: white; line-height: 1.2;">
        <strong style="font-size: 16px; color: #002136">Punto de Destino</strong>
        <div style="font-size: 14px; color: #4a4a4a;">${address}</div>
      </div>
    `;
      this.infoWindow.setContent(html);
      this.infoWindow.open(this.map, this.marker);
    });
  }

  private placeMarker(location: any): void {
    if (this.marker) {
      this.marker.setPosition(location);
    } else {
      this.marker = new google.maps.Marker({
        position: location,
        map: this.map,
        icon: {
          url: 'assets/images/marker.png',
          scaledSize: new google.maps.Size(50, 40),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(20, 40)
        }
      });
    }
    this.map.panTo(location);
  }

  private toNumber6(v: any): number | null {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return Number.isFinite(n) ? Number(n.toFixed(6)) : null;
  }

  private loadGoogleMaps(apiKey: string): Promise<void> {
    const w = window as any;
    if (w.google && w.google.maps) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const scriptId = 'gmaps-sdk';
      if (document.getElementById(scriptId)) {
        (document.getElementById(scriptId) as HTMLScriptElement).addEventListener('load', () => resolve());
        return;
      }
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
      document.head.appendChild(script);
    });
  }
  regresar() {
    this.route.navigateByUrl('/administracion/transacciones')
  }

  /** Para <input type="datetime-local">: YYYY-MM-DDTHH:mm */
  private nowForDatetimeLocal(): string {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const MI = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${HH}:${MI}`;
  }

  /** Convierte 'YYYY-MM-DDTHH:mm' (local) → 'YYYY-MM-DDTHH:mm:00±HH:MM' respetando tu hora local */
  private localDatetimeToOffsetISO(localStr: string | null): string | null {
    if (!localStr) return null;
    const d = new Date(localStr); // interpreta como local
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const HH = String(d.getHours()).padStart(2, '0');
    const MI = String(d.getMinutes()).padStart(2, '0');
    const tz = d.getTimezoneOffset(); // min respecto a UTC (MX suele ser 360)
    const sign = tz > 0 ? '-' : '+';
    const offH = String(Math.floor(Math.abs(tz) / 60)).padStart(2, '0');
    const offM = String(Math.abs(tz) % 60).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${HH}:${MI}:00${sign}${offH}:${offM}`;
  }


}
