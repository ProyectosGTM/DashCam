import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { debounceTime, distinctUntilChanged, finalize, forkJoin } from 'rxjs';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { ClientesService } from 'src/app/pages/services/clientes.service';
import { DispositivoBluevoxService } from 'src/app/pages/services/dispositivobluevox.service';
import { DispositivosService } from 'src/app/pages/services/dispositivos.service';
import { InstalacionesService } from 'src/app/pages/services/instalaciones.service';
import { VehiculosService } from 'src/app/pages/services/vehiculos.service';

enum EstadoComponente {
  INACTIVO = 0,
  DISPONIBLE = 1,
  ASIGNADO = 2,
  EN_MANTENIMIENTO = 3,
  DANADO = 4,
  RETIRADO = 5,
}

@Component({
  selector: 'vex-agregar-instalacion',
  templateUrl: './agregar-instalacion.component.html',
  styleUrl: './agregar-instalacion.component.scss',
  animations: [fadeInRight400ms],
})
export class AgregarInstalacionComponent implements OnInit {

  layoutCtrl = new UntypedFormControl('fullwidth');
  submitButton = 'Guardar';
  loading = false;
  instalacionesForm!: FormGroup;
  idInstalacion!: number;
  title = 'Agregar Instalación';

  loadingDependientes = false;
  listaClientes: any[] = [];
  listaValidadores: any[] = [];
  listaContadores: any[] = [];
  listaVehiculos: any[] = [];

  idClienteUser!: number;
  idRolUser!: number;
  get isAdmin(): boolean { return this.idRolUser === 1; }

  private bootstrapping = false;
  private lastLoadedCliente: number | null = null;

  private pendingSelecciones: { idValidador?: any; idContadora?: any; idVehiculo?: any } = {};
  private pendingLabels: { dispositivo?: string | null; bluevox?: string | null; vehiculo?: string | null } = {};

  initialDispositivoId?: number | null;
  initialBlueVoxId?: number | null;

  estatusDispositivoAnterior?: number | null;
  estatusBluevoxsAnterior?: number | null;
  comentarios?: string | null;

  constructor(
    private fb: FormBuilder,
    private instService: InstalacionesService,
    private activatedRouted: ActivatedRoute,
    private route: Router,
    private dispoService: DispositivosService,
    private blueVoService: DispositivoBluevoxService,
    private vehiService: VehiculosService,
    private clieService: ClientesService,
    private users: AuthenticationService,
    private cdr: ChangeDetectorRef,
    private alerts: AlertsService,
  ) {
    const user = this.users.getUser();
    this.idClienteUser = Number(user?.idCliente);
    this.idRolUser = Number(user?.rol?.id);
  }

  ngOnInit(): void {
    this.initForm();
    this.suscribirCambioCliente();
    this.suscribirCambioEquipos();
    this.obtenerClientes();

    this.activatedRouted.params.subscribe((params) => {
      this.idInstalacion = Number(params['idInstalacion']);
      if (this.idInstalacion) {
        this.title = 'Actualizar Instalación';
        this.obtenerInstalacion();
        const opts = { emitEvent: false };
        this.instalacionesForm.get('idCliente')?.disable(opts);
        this.instalacionesForm.get('idVehiculo')?.disable(opts);
      }
    });
  }

  private keepEditLocks(): void {
    if (this.idInstalacion) {
      const opts = { emitEvent: false };
      this.instalacionesForm.get('idCliente')?.disable(opts);
      this.instalacionesForm.get('idVehiculo')?.disable(opts);
    }
  }

  initForm(): void {
    this.instalacionesForm = this.fb.group({
      estatus: [1, Validators.required],
      idCliente: [this.isAdmin ? null : this.idClienteUser, Validators.required],
      idValidador: [{ value: null, disabled: true }, Validators.required],
      idContadora: [{ value: null, disabled: true }, Validators.required],
      idVehiculo: [{ value: null, disabled: true }, Validators.required],
    });

    if (!this.isAdmin) this.instalacionesForm.get('idCliente')?.disable({ onlySelf: true });
  }

  private toNumOrNull(v: any): number | null {
    return v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v);
  }

  private pickId(obj: any, keys: string[]): any {
    for (const k of keys) if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
    return null;
  }

  private ensureArray(maybe: any): any[] {
    if (Array.isArray(maybe)) return maybe;
    if (Array.isArray(maybe?.data)) return maybe.data;
    if (maybe && typeof maybe === 'object') {
      const vals = Object.values(maybe);
      const firstArr = vals.find((v) => Array.isArray(v));
      if (firstArr) return firstArr as any[];
    }
    return [];
  }

  private normalizeId<T>(arr: T[] = [], keys: string[] = ['id']): (T & { id: number })[] {
    return (arr || []).map((x: any) => ({ ...x, id: Number(this.pickId(x, keys)) }));
  }

  private desactivarCamposDependientes(disabled: boolean) {
    if (!this.instalacionesForm) return;
    const opts = { emitEvent: false };
    const idValidador = this.instalacionesForm.get('idValidador');
    const idContadora = this.instalacionesForm.get('idContadora');
    const idVehiculo = this.instalacionesForm.get('idVehiculo');

    if (disabled) {
      idValidador?.disable(opts);
      idContadora?.disable(opts);
      idVehiculo?.disable(opts);
    } else {
      idValidador?.enable(opts);
      idContadora?.enable(opts);
      idVehiculo?.enable(opts);
      this.keepEditLocks();
    }
  }

  private limpiarDependientes(): void {
    const opts = { emitEvent: false };
    this.instalacionesForm.patchValue({ idValidador: null, idContadora: null, idVehiculo: null }, opts);
    this.listaValidadores = [];
    this.listaContadores = [];
    this.listaVehiculos = [];
  }

  private ensureSelectedOptionVisible(
    list: any[],
    selectedId: number | null | undefined,
    displayLabel: string | null | undefined,
    labelField: string
  ): any[] {
    const id = selectedId == null ? null : Number(selectedId);
    if (id == null) return list;
    const exists = list.some((x) => Number(x.id) === id);
    if (!exists) list.unshift({ id, [labelField]: displayLabel || String(id) });
    return list;
  }

  private suscribirCambioCliente(): void {
    this.instalacionesForm
      .get('idCliente')
      ?.valueChanges.pipe(debounceTime(150), distinctUntilChanged())
      .subscribe((idCliente: any) => {
        if (this.bootstrapping) return;
        if (!idCliente) {
          this.limpiarDependientes();
          this.desactivarCamposDependientes(true);
          this.lastLoadedCliente = null;
          return;
        }
        const id = Number(idCliente);
        if (this.lastLoadedCliente === id) return;
        this.cargarListasPorCliente(id, false);
      });
  }

  private suscribirCambioEquipos(): void {
    this.instalacionesForm.get('idValidador')?.valueChanges.subscribe(async (nuevo: any) => {
      if (this.bootstrapping || !this.idInstalacion) return; // solo en edición
      const prev = this.initialDispositivoId;
      if (prev != null && Number(nuevo) !== Number(prev)) {
        const r = await this.solicitarEstadoYComentarios('¿A qué estado deseas cambiar el dispositivo anterior?');
        if (r) {
          this.estatusDispositivoAnterior = r.estado ?? null;
          this.comentarios = r.comentarios ?? this.comentarios ?? null; // puede ir null
          this.initialDispositivoId = Number(nuevo);
        }
      }
    });

    this.instalacionesForm.get('idContadora')?.valueChanges.subscribe(async (nuevo: any) => {
      if (this.bootstrapping || !this.idInstalacion) return; // solo en edición
      const prev = this.initialBlueVoxId;
      if (prev != null && Number(nuevo) !== Number(prev)) {
        const r = await this.solicitarEstadoYComentarios('¿A qué estado deseas cambiar el BlueVox anterior?');
        if (r) {
          this.estatusBluevoxsAnterior = r.estado ?? null;
          this.comentarios = r.comentarios ?? this.comentarios ?? null; // puede ir null
          this.initialBlueVoxId = Number(nuevo);
        }
      }
    });
  }

  private estadoInputOptions(): Record<string, string> {
    return {
      [EstadoComponente.INACTIVO]: 'INACTIVO',
      [EstadoComponente.DISPONIBLE]: 'DISPONIBLE',
      [EstadoComponente.ASIGNADO]: 'ASIGNADO',
      [EstadoComponente.EN_MANTENIMIENTO]: 'EN_MANTENIMIENTO',
      [EstadoComponente.DANADO]: 'DAÑADO',
      [EstadoComponente.RETIRADO]: 'RETIRADO',
    };
  }

private async solicitarEstadoYComentarios(titulo: string): Promise<{ estado: number; comentarios: string | null } | null> {
  const html = `
    <div style="text-align:left">
      <label style="display:block;margin:12px 0 6px;font-size:12.5px;font-weight:600;color:#9fb0c3;">
        Selecciona el estado
      </label>
      <select id="estado-select" style="width:100%;background:#0b121b;color:#e9eef5;border:1px solid #213041;border-radius:10px;padding:10px 12px;height:44px;transition:border-color .15s ease, box-shadow .15s ease, background .15s ease;">
        <option value="">-- Selecciona --</option>
        ${Object.entries(this.estadoInputOptions()).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
      </select>

      <label style="display:block;margin:12px 0 6px;font-size:12.5px;font-weight:600;color:#9fb0c3;">
        Comentarios (opcional)
      </label>
      <input id="comentarios-input" placeholder="Escribe comentarios"
        style="width:72%;max-width:420px;min-width:240px;margin:0 auto;display:block;background:#0b121b;color:#e9eef5;border:1px solid #213041;border-radius:10px;padding:10px 12px;height:44px;transition:border-color .15s ease, box-shadow .15s ease, background .15s ease;" />
    </div>
  `;

  const res = await this.alerts.open({
    type: 'info',
    title: titulo,
    message: html,
    confirmText: 'Aceptar',
    cancelText: 'Cancelar',
    backdropClose: false
  });

  if (res !== 'confirm') return null;

  const estadoEl = document.getElementById('estado-select') as HTMLSelectElement | null;
  const comentariosEl = document.getElementById('comentarios-input') as HTMLInputElement | null;

  const estadoStr = estadoEl?.value ?? '';
  if (!estadoStr) {
    await this.alerts.open({
      type: 'error',
      title: '¡Ops!',
      message: 'Selecciona un estado',
      confirmText: 'Entendido',
      backdropClose: false
    });
    return null;
  }

  return {
    estado: Number(estadoStr),
    comentarios: (comentariosEl?.value ?? '').trim() || null
  };
}



  private cargarListasPorCliente(idCliente: number, applyPending: boolean): void {
    this.loadingDependientes = true;
    this.limpiarDependientes();
    this.desactivarCamposDependientes(true);

    const n = (v: any) => (v == null ? null : Number(v));

    forkJoin({
      dispositivos: this.dispoService.obtenerDispositivosByCliente(idCliente),
      bluevox: this.blueVoService.obtenerDispositivosBlueByCliente(idCliente),
      vehiculos: this.vehiService.obtenerVehiculosByCliente(idCliente),
    })
      .pipe(finalize(() => (this.loadingDependientes = false)))
      .subscribe({
        next: (resp: any) => {
          const devsRaw = this.ensureArray(resp?.dispositivos ?? resp?.data?.dispositivos ?? resp?.data);
          const bvxRaw = this.ensureArray(resp?.bluevox ?? resp?.data?.bluevox ?? resp?.data);
          const vehRaw = this.ensureArray(resp?.vehiculos ?? resp?.data?.vehiculos ?? resp?.data);

          this.listaValidadores = this.normalizeId(devsRaw, ['id', 'idValidador', 'idValidador', 'idValidador']);
          this.listaContadores = this.normalizeId(bvxRaw, ['id', 'idContadora', 'idContadora', 'idContadora']);
          this.listaVehiculos = this.normalizeId(vehRaw, ['id', 'idVehiculo', 'IdVehiculo', 'IDVehiculo']);

          if (!this.listaValidadores?.length) this.listaValidadores = [];
          this.listaValidadores = this.ensureSelectedOptionVisible(
            this.listaValidadores, this.pendingSelecciones?.idValidador, this.pendingLabels.dispositivo, 'numeroSerie'
          );

          if (!this.listaContadores?.length) this.listaContadores = [];
          this.listaContadores = this.ensureSelectedOptionVisible(
            this.listaContadores, this.pendingSelecciones?.idContadora, this.pendingLabels.bluevox, 'numeroSerieBlueVox'
          );

          if (!this.listaVehiculos?.length) this.listaVehiculos = [];
          this.listaVehiculos = this.ensureSelectedOptionVisible(
            this.listaVehiculos, this.pendingSelecciones?.idVehiculo, this.pendingLabels.vehiculo, 'placa'
          );

          this.desactivarCamposDependientes(false);

          if (applyPending) {
            const f = this.instalacionesForm;
            f.get('idValidador')?.setValue(n(this.pendingSelecciones.idValidador), { emitEvent: false });
            f.get('idContadora')?.setValue(n(this.pendingSelecciones.idContadora), { emitEvent: false });
            f.get('idVehiculo')?.setValue(n(this.pendingSelecciones.idVehiculo), { emitEvent: false });
            this.pendingSelecciones = {};
          }

          this.lastLoadedCliente = idCliente;
          this.instalacionesForm.updateValueAndValidity({ emitEvent: false });
          this.bootstrapping = false;
          this.cdr.detectChanges();
        },

        error: (err) => {
          console.error('[cargarListasPorCliente] error:', err);

          this.listaValidadores = this.ensureSelectedOptionVisible(
            [], this.pendingSelecciones?.idValidador, this.pendingLabels.dispositivo, 'numeroSerie'
          );
          this.listaContadores = this.ensureSelectedOptionVisible(
            [], this.pendingSelecciones?.idContadora, this.pendingLabels.bluevox, 'numeroSerieBlueVox'
          );
          this.listaVehiculos = this.ensureSelectedOptionVisible(
            [], this.pendingSelecciones?.idVehiculo, this.pendingLabels.vehiculo, 'placa'
          );

          const f = this.instalacionesForm;
          const n = (v: any) => (v == null ? null : Number(v));
          if (this.pendingSelecciones.idValidador != null) f.get('idValidador')?.setValue(n(this.pendingSelecciones.idValidador), { emitEvent: false });
          if (this.pendingSelecciones.idContadora != null) f.get('idContadora')?.setValue(n(this.pendingSelecciones.idContadora), { emitEvent: false });
          if (this.pendingSelecciones.idVehiculo != null) f.get('idVehiculo')?.setValue(n(this.pendingSelecciones.idVehiculo), { emitEvent: false });
          this.pendingSelecciones = {};

          this.desactivarCamposDependientes(false);
          this.bootstrapping = false;
          this.instalacionesForm.updateValueAndValidity({ emitEvent: false });
          this.cdr.detectChanges();
        },
      });
  }

  obtenerInstalacion(): void {
    this.bootstrapping = true;

    this.instService.obtenerInstalacion(this.idInstalacion).subscribe((response: any) => {
      const raw = Array.isArray(response?.data) ? response.data[0] : response?.data || {};
      if (!raw) { this.bootstrapping = false; return; }

      const idClienteSrv = this.toNumOrNull(raw.idCliente ?? raw?.idCliente2?.id);
      const estatus = this.toNumOrNull(raw.estatus) ?? 1;
      const idValidador = this.toNumOrNull(raw.idValidador ?? raw?.dispositivos?.id);
      const idContadora = this.toNumOrNull(raw.idContadora ?? raw?.blueVoxs?.id);
      const idVehiculo = this.toNumOrNull(raw.idVehiculo ?? raw?.vehiculos?.id);

      this.initialDispositivoId = idValidador ?? null;
      this.initialBlueVoxId = idContadora ?? null;

      this.pendingLabels = {
        dispositivo: raw?.numeroSerieDispositivo ?? raw?.numeroSerie ?? null,
        bluevox: raw?.numeroSerieBlueVox ?? raw?.numeroSerie ?? null,
        vehiculo: raw?.placaVehiculo ?? raw?.placa ?? raw?.numeroEconomicoVehiculo ?? null,
      };

      const idCliente = this.isAdmin ? idClienteSrv : this.idClienteUser;

      this.instalacionesForm.patchValue({ idCliente, estatus }, { emitEvent: false });
      this.pendingSelecciones = { idValidador, idContadora, idVehiculo };

      if (idCliente) {
        this.cargarListasPorCliente(idCliente, true);
      } else {
        this.listaValidadores = this.ensureSelectedOptionVisible([], idValidador, this.pendingLabels.dispositivo, 'numeroSerie');
        this.listaContadores = this.ensureSelectedOptionVisible([], idContadora, this.pendingLabels.bluevox, 'numeroSerieBlueVox');
        this.listaVehiculos = this.ensureSelectedOptionVisible([], idVehiculo, this.pendingLabels.vehiculo, 'placa');

        const f = this.instalacionesForm; const opts = { emitEvent: false };
        if (idValidador != null) f.get('idValidador')?.patchValue(idValidador, opts);
        if (idContadora != null) f.get('idContadora')?.patchValue(idContadora, opts);
        if (idVehiculo != null) f.get('idVehiculo')?.patchValue(idVehiculo, opts);

        this.desactivarCamposDependientes(false);
        f.updateValueAndValidity({ emitEvent: false });
        this.bootstrapping = false;
        this.cdr.detectChanges();
      }
    });
  }

  obtenerClientes(): void {
    this.clieService.obtenerClientes().subscribe((response: any) => {
      this.listaClientes = this.normalizeId(response?.data);
      if (!this.idInstalacion && !this.isAdmin) {
        this.instalacionesForm.get('idCliente')?.setValue(this.idClienteUser, { emitEvent: false });
        this.cargarListasPorCliente(this.idClienteUser, false);
      }
    });
  }

  submit() {
    this.submitButton = 'Cargando...';
    this.loading = true;
    if (this.idInstalacion) {
      this.actualizar();
    } else {
      this.agregar();
    }
  }

  async agregar() {
    this.submitButton = 'Cargando...';
    this.loading = true;

    // === VALIDACIÓN SIN MÉTODOS NUEVOS (cuenta disabled) ===
    const etiquetas: any = {
      idValidador: 'Validador',
      idContador: 'Contador',
      idVehiculo: 'Vehículo',
      idCliente: 'Cliente',
    };
    const requeridos = ['idValidador', 'idContador', 'idVehiculo', 'idCliente'];
    const raw = this.instalacionesForm.getRawValue();
    const camposFaltantes: string[] = requeridos.filter(k => !raw[k]).map(k => etiquetas[k] || k);

    if (camposFaltantes.length > 0) {
      this.submitButton = 'Guardar';
      this.loading = false;

      const lista = camposFaltantes.map((campo, index) => `
      <div style="padding: 8px 12px; border-left: 4px solid #d9534f;
                  background: #caa8a8; text-align: center; margin-bottom: 8px;
                  border-radius: 4px;">
        <strong style="color: #b02a37;">${index + 1}. ${campo}</strong>
      </div>
    `).join('');

      await this.alerts.open({
        type: 'warning',
        title: '¡Faltan campos obligatorios!',
        message: `
        <p style="text-align: center; font-size: 15px; margin-bottom: 16px; color: white">
          Los siguientes <strong>campos obligatorios</strong> están vacíos.<br>
          Por favor complétalos antes de continuar:
        </p>
        <div style="max-height: 350px; overflow-y: auto;">${lista}</div>
      `,
        confirmText: 'Entendido',
        backdropClose: false,
      });
      return;
    }

    const payload = this.instalacionesForm.getRawValue();
    this.instService.agregarInstalacion(payload).subscribe(
      () => {
        this.submitButton = 'Guardar';
        this.loading = false;
        this.alerts.open({
          type: 'success',
          title: '¡Operación Exitosa!',
          message: 'Se agregó una nueva instalación de manera exitosa.',
          confirmText: 'Confirmar',
          backdropClose: false,
        });
        this.regresar();
      },
      () => {
        this.submitButton = 'Guardar';
        this.loading = false;
        this.alerts.open({
          type: 'error',
          title: '¡Ops!',
          message: 'Ocurrió un error al agregar la instalación.',
          confirmText: 'Confirmar',
          backdropClose: false,
        });
      }
    );
  }

  async actualizar() {
    this.submitButton = 'Cargando...';
    this.loading = true;
    const etiquetas: any = {
      idValidador: 'Validador',
      idContador: 'Contador',
      idVehiculo: 'Vehículo',
      idCliente: 'Cliente',
    };
    const requeridos = ['idValidador', 'idContador', 'idVehiculo', 'idCliente'];
    const raw = this.instalacionesForm.getRawValue();

    // Construimos EXACTAMENTE el payload requerido
    const payload = {
      idValidador: this.toNumOrNull(raw.idValidador),                 // puede ir null
      estatusDispositivoAnterior: this.estatusDispositivoAnterior ?? null, // puede ir null
      idContadora: this.toNumOrNull(raw.idContadora),                         // número o null
      estatusBluevoxsAnterior: this.estatusBluevoxsAnterior ?? null,      // número o null
      idCliente: this.toNumOrNull(raw.idCliente) ?? this.idClienteUser,   // asegúrate de enviar cliente
      comentarios: (this.comentarios ?? null)                             // string o null
    };
    const camposFaltantes: string[] = requeridos.filter(k => !raw[k]).map(k => etiquetas[k] || k);

    if (camposFaltantes.length > 0) {
      this.submitButton = 'Actualizar';
      this.loading = false;

      const lista = camposFaltantes.map((campo, index) => `
      <div style="padding: 8px 12px; border-left: 4px solid #d9534f;
                  background: #caa8a8; text-align: center; margin-bottom: 8px;
                  border-radius: 4px;">
        <strong style="color: #b02a37;">${index + 1}. ${campo}</strong>
      </div>
    `).join('');

      await this.alerts.open({
        type: 'warning',
        title: '¡Faltan campos obligatorios!',
        message: `
        <p style="text-align: center; font-size: 15px; margin-bottom: 16px; color: white">
          Los siguientes <strong>campos obligatorios</strong> están vacíos.<br>
          Por favor complétalos antes de continuar:
        </p>
        <div style="max-height: 350px; overflow-y: auto;">${lista}</div>
      `,
        confirmText: 'Entendido',
        backdropClose: false,
      });
      return;
    }

    this.instService.actualizarInstalacion(this.idInstalacion, payload).subscribe(
      () => {
        this.submitButton = 'Actualizar';
        this.loading = false;
        this.alerts.open({
          type: 'success',
          title: '¡Operación Exitosa!',
          message: 'Los datos de la instalación se actualizaron correctamente.',
          confirmText: 'Confirmar',
          backdropClose: false,
        });
        this.regresar();
      },
      () => {
        this.submitButton = 'Actualizar';
        this.loading = false;
        this.alerts.open({
          type: 'error',
          title: '¡Ops!',
          message: 'Ocurrió un error al actualizar la instalación.',
          confirmText: 'Confirmar',
          backdropClose: false,
        });
      }
    );
  }


  compareId = (a: any, b: any) => a != null && b != null && Number(a) === Number(b);
  trackId = (_: number, item: any) => Number(item?.id);

  regresar(): void {
    this.route.navigateByUrl('/administracion/instalaciones');
  }
}
