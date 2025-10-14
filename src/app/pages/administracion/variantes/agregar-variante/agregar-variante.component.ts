import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { UntypedFormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';

/** Coordenadas geográficas */
interface Coordenada { lat: number; lng: number; }

/** Rutas (mostramos TODAS en el paso 2) */
interface Ruta {
  id: number | string;
  nombre: string;
  origen: string;
  destino: string;
  paradas: number;           // compatibilidad; no se muestra
  distanciaKm: number;
  actualizada: Date;
  fechaCreacion: Date;
  zonaId: number | string;
  inicio: any;        // punto de inicio (CDMX aprox)
  fin: any;           // punto final (CDMX aprox)
}

@Component({
  selector: 'vex-agregar-variante',
  templateUrl: './agregar-variante.component.html',
  styleUrl: './agregar-variante.component.scss',
  animations: [fadeInRight400ms],
})
export class AgregarVarianteComponent implements OnInit, AfterViewInit, OnDestroy {
  layoutCtrl = new UntypedFormControl('fullwidth');

  /** Paso actual */
  step: 1 | 2 | 3 | 4 = 1;

  // ==========================
  // ZONAS (Paso 1)
  // ==========================
  search = '';
  zonas: Array<{
    id: number | string;
    nombre: string;
    activa: boolean;
    rutas: number;
    variantes: number;
    color?: string;
    descripcion?: string;
  }> = [
      { id: 1, nombre: 'Zona Centro', activa: true, rutas: 12, variantes: 34, color: '#1F5AA8', descripcion: 'Corredor central y área administrativa.' },
      { id: 2, nombre: 'Zona Norte', activa: true, rutas: 8, variantes: 15, color: '#1F5AA8', descripcion: 'Barrios residenciales y zona industrial ligera.' },
      { id: 3, nombre: 'Zona Sur', activa: true, rutas: 6, variantes: 7, color: '#1F5AA8', descripcion: 'Conecta colonias del sur con el centro.' },
    ];
  zonasFiltradas = [...this.zonas];
  selectedZona: typeof this.zonas[number] | null = null;

  trackById = (_: number, item: { id: number | string }) => item.id;

  filtrar(): void {
    const s = (this.search || '').toLowerCase().trim();
    this.zonasFiltradas = this.zonas.filter(z => !s || z.nombre.toLowerCase().includes(s));
  }
  selectZona(z: any) { this.selectedZona = z; }
  limpiarFiltros(): void { this.search = ''; this.filtrar(); }

  // ==========================
  // RUTAS (Paso 2) — se muestran TODAS
  // ==========================
  searchRuta = '';
  rutas: Ruta[] = [
    {
      id: 301, nombre: 'Ruta Sur 1', origen: 'Col. Sur', destino: 'Centro',
      paradas: 8, distanciaKm: 12.9, actualizada: new Date(), fechaCreacion: new Date('2025-06-10'), zonaId: 3,
      inicio: { lat: 19.3437, lng: -99.1606 },   // Coyoacán
      fin: { lat: 19.4326, lng: -99.1332 }    // Zócalo
    },
    {
      id: 302, nombre: 'Ruta Sur 2', origen: 'Unidad Morelos', destino: 'Terminal Norte',
      paradas: 10, distanciaKm: 16.2, actualizada: new Date(), fechaCreacion: new Date('2025-07-03'), zonaId: 3,
      inicio: { lat: 19.4260, lng: -99.1270 },   // Col. Morelos
      fin: { lat: 19.4751, lng: -99.1395 }    // Terminal Autobuses del Norte
    },
    {
      id: 101, nombre: 'Ruta Centro A', origen: 'Plaza Mayor', destino: 'Universidad',
      paradas: 9, distanciaKm: 14.2, actualizada: new Date(), fechaCreacion: new Date('2025-05-22'), zonaId: 1,
      inicio: { lat: 19.4352, lng: -99.1412 },   // Alameda Central
      fin: { lat: 19.3320, lng: -99.1870 }    // CU/UNAM
    },
    {
      id: 201, nombre: 'Ruta Norte X', origen: 'Col. Norte', destino: 'Parque Central',
      paradas: 11, distanciaKm: 21.3, actualizada: new Date(), fechaCreacion: new Date('2025-04-15'), zonaId: 2,
      inicio: { lat: 19.4870, lng: -99.1270 },   // Lindavista
      fin: { lat: 19.4352, lng: -99.1412 }    // Alameda Central
    },
  ];
  rutasZona: Ruta[] = [];
  rutasFiltradas: Ruta[] = [];
  selectedRuta: Ruta | null = null;

  trackByRuta = (_: number, item: Ruta) => item.id;

  private cargarRutasDeZona(): void {
    // Mostramos TODAS
    this.rutasZona = [...this.rutas].sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
    this.rutasFiltradas = [...this.rutasZona];
    this.searchRuta = '';
    this.selectedRuta = null;
  }

  filtrarRutas(): void {
    const s = (this.searchRuta || '').toLowerCase().trim();
    this.rutasFiltradas = this.rutasZona.filter(r =>
      !s || r.nombre.toLowerCase().includes(s) || r.origen.toLowerCase().includes(s) || r.destino.toLowerCase().includes(s)
    );
  }
  selectRuta(r: Ruta) { this.selectedRuta = r; }

  // ==========================
  // GOOGLE MAPS (Paso 3)
  // ==========================
  private readonly mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    fullscreenControl: true,
    zoomControl: true,
    streetViewControl: false,
    clickableIcons: false,
    center: { lat: 19.4326, lng: -99.1332 }, // CDMX
    zoom: 12,
  };

  private gmap: google.maps.Map | null = null;
  private startMarker: google.maps.Marker | null = null;
  private endMarker: google.maps.Marker | null = null;
  private markerIcon?: google.maps.Icon;          // ícono corporativo para inicio/fin

  // Dibujo interactivo
  private mapClickListener: google.maps.MapsEventListener | null = null;
  private pathPolyline: google.maps.Polyline | null = null;
  private pathPoints: google.maps.LatLngLiteral[] = [];
  private pathPointMarkers: google.maps.Marker[] = [];

  // Línea azul corporativa
  private readonly polylineStyle: google.maps.PolylineOptions = {
    strokeColor: '#1F5AA8',
    strokeOpacity: 1,
    strokeWeight: 4
  };

  // Estrella negra para puntos del trazado
  private readonly starPoint: google.maps.Symbol = {
    // 5 puntas, centrada
    path: 'M 0 -8 L 2 -2 L 8 -2 L 3 1 L 5 7 L 0 3 L -5 7 L -3 1 L -8 -2 L -2 -2 Z',
    fillColor: '#000000',
    fillOpacity: 1,
    strokeColor: '#000000',
    strokeWeight: 1,
    scale: 1.1
  };

  // 1) Sustituye la propiedad 'starPoint' por esto:
  private readonly circlePoint: google.maps.Symbol = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#000000',
    fillOpacity: 1,
    strokeColor: '#000000',
    strokeWeight: 1,
    scale: 5, // tamaño del punto
  };


  // Control de flujo del trazado
  isRouteFinalized = false;  // si el usuario terminó el trayecto
  isDrawing = false;         // si estamos aceptando clics para trazar

  get canFinalize(): boolean {
    return this.pathPoints.length >= 2 && !this.isRouteFinalized;
  }

  // ==========================
  // TARIFA (Paso 4) — Reactive Form
  // ==========================
  tarifaForm!: FormGroup;

  constructor(private fb: FormBuilder, private alerts: AlertsService,) { }

  ngOnInit(): void {
    this.tarifaForm = this.fb.group({
      tarifaBase: [null, [Validators.required, Validators.min(0)]],
      distancia: [null, [Validators.required, Validators.min(0)]],
      incrementoPorMetro: [null, [Validators.required, Validators.min(0)]],
      costoAdicional: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngAfterViewInit(): void { }
  ngOnDestroy(): void { this.destroyMap(); }

  // ==========================
  // Helpers de Google Maps
  // ==========================
  private ensureGoogleLoaded(): Promise<void> {
    return new Promise(resolve => {
      if ((window as any).google?.maps) return resolve();
      const id = setInterval(() => {
        if ((window as any).google?.maps) { clearInterval(id); resolve(); }
      }, 50);
    });
  }

  private setDrawingEnabled(on: boolean): void {
    if (!this.gmap) return;

    this.mapClickListener?.remove();
    this.mapClickListener = null;

    if (on) {
      this.gmap.setOptions({ draggableCursor: 'crosshair' });
      this.mapClickListener = this.gmap.addListener('click', (ev: google.maps.MapMouseEvent) => {
        if (ev.latLng) this.addPathPoint(ev.latLng);
      });
    } else {
      this.gmap.setOptions({ draggableCursor: undefined });
    }
    this.isDrawing = on;
  }

  private enableDrawingMode(): void {
    if (!this.gmap || this.isRouteFinalized) return;

    if (!this.pathPolyline) {
      this.pathPolyline = new google.maps.Polyline({
        ...this.polylineStyle,
        path: this.pathPoints,
        map: this.gmap!
      });
    }
    this.setDrawingEnabled(true);
  }

  private addPathPoint(latLng: google.maps.LatLng | google.maps.LatLngLiteral): void {
    const ll = (latLng as google.maps.LatLng).toJSON
      ? (latLng as google.maps.LatLng).toJSON()
      : (latLng as google.maps.LatLngLiteral);

    this.pathPoints.push(ll);

    const marker = new google.maps.Marker({
      map: this.gmap!,
      position: ll,
      icon: this.circlePoint
    });
    this.pathPointMarkers.push(marker);

    this.pathPolyline?.setPath(this.pathPoints);
  }

  public deshacerUltimoPunto(): void {
    if (!this.pathPoints.length || this.isRouteFinalized) return;
    this.pathPoints.pop();
    const m = this.pathPointMarkers.pop();
    m?.setMap(null);
    this.pathPolyline?.setPath(this.pathPoints);
  }

  public limpiarTrazo(): void {
    this.resetDrawing();
    this.isRouteFinalized = false;
    this.setDrawingEnabled(true);
  }

  public obtenerTrazo(): google.maps.LatLngLiteral[] {
    return [...this.pathPoints];
  }

  private resetDrawing(): void {
    this.pathPointMarkers.forEach(m => m.setMap(null));
    this.pathPointMarkers = [];
    this.pathPoints = [];

    if (this.pathPolyline) {
      this.pathPolyline.setMap(null as any);
      this.pathPolyline = null;
    }

    this.mapClickListener?.remove();
    this.mapClickListener = null;
    this.isDrawing = false;
    // isRouteFinalized se conserva (por si venimos de Tarifa y volvemos a paso 3)
  }

  public finalizarTrayecto(): void {
    if (!this.canFinalize) return;
    this.setDrawingEnabled(false);
    this.isRouteFinalized = true;
  }

  private async renderGoogleMap(): Promise<void> {
    if (!this.selectedRuta) return;

    await this.ensureGoogleLoaded();

    const el = document.getElementById('map');
    if (!el) return;

    if (!this.gmap) {
      this.gmap = new google.maps.Map(el, this.mapOptions);
    }

    // Crea ícono corporativo al vuelo (usa tu logo)
    if (!this.markerIcon) {
      this.markerIcon = {
        url: 'assets/img/logo/logoMap.png',
        scaledSize: new google.maps.Size(40, 40),
        size: new google.maps.Size(40, 40),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20, 40)
      };
    }

    // Limpia marcadores previos
    this.startMarker?.setMap(null);
    this.endMarker?.setMap(null);
    this.startMarker = null;
    this.endMarker = null;

    const start: google.maps.LatLngLiteral = { ...this.selectedRuta.inicio };
    const end: google.maps.LatLngLiteral = { ...this.selectedRuta.fin };

    // Marcadores corporativos
    this.startMarker = new google.maps.Marker({
      map: this.gmap!,
      position: start,
      title: `Inicio: ${this.selectedRuta.origen}`,
      icon: this.markerIcon
    });
    this.endMarker = new google.maps.Marker({
      map: this.gmap!,
      position: end,
      title: `Fin: ${this.selectedRuta.destino}`,
      icon: this.markerIcon
    });

    // Ajuste de vista
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(start);
    bounds.extend(end);
    this.gmap.fitBounds(bounds);
    setTimeout(() => this.gmap && this.gmap!.fitBounds(bounds), 200);

    // Trazado (solo si no ha sido finalizado)
    if (!this.isRouteFinalized) {
      this.enableDrawingMode();
    } else {
      this.setDrawingEnabled(false);
    }
  }

  private destroyMap(): void {
    // Marcadores inicio/fin
    this.startMarker?.setMap(null); this.startMarker = null;
    this.endMarker?.setMap(null); this.endMarker = null;

    // Dibujo
    this.resetDrawing();

    // No destruimos this.gmap para conservar estado visual si vuelven al paso 3;
    // si deseas destruirlo: this.gmap = null;
  }

  // ==========================
  // Navegación de pasos
  // ==========================
  goStep1(): void {
    this.step = 1;
    this.selectedRuta = null;
    this.isRouteFinalized = false;
    this.destroyMap();
  }

  goStep2(): void {
    if (!this.selectedZona) return;
    this.cargarRutasDeZona();
    this.step = 2;
    this.isRouteFinalized = false;
    this.destroyMap();
  }

  goStep3(): void {
    if (!this.selectedRuta) return;
    this.step = 3;
    // Mantiene el estado de finalización si ya estaba finalizado
    setTimeout(() => this.renderGoogleMap(), 0);
  }

  goStep4(): void {
    if (!this.isRouteFinalized) return;   // solo si finalizó el trayecto
    this.step = 4;
  }

  // ==========================
  // Tarifa (acciones)
  // ==========================
  isTarifaValida(): boolean {
    return this.tarifaForm.valid;
  }

  guardarTarifa(): void {
    if (this.tarifaForm.invalid) {
      this.tarifaForm.markAllAsTouched();
      return;
    }
    this.alerts.open({
      type: 'success',
      title: '¡Proceso Finalizado!',
      message: 'Debes arrastar un encabezado de una columna para expandir o contraer grupos.',
      backdropClose: false
    });
    const datos = this.tarifaForm.value;
    console.log('Tarifa guardada:', datos, 'Trazo:', this.obtenerTrazo(), 'Ruta:', this.selectedRuta);
    // TODO: enviar al backend o siguiente flujo
  }
}
