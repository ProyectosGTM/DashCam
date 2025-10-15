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

@Component({
  selector: 'vex-agregar-instalacion',
  templateUrl: './agregar-instalacion.component.html',
  styleUrl: './agregar-instalacion.component.scss',
  animations: [fadeInRight400ms],
})
export class AgregarInstalacionComponent implements OnInit {

  layoutCtrl = new UntypedFormControl('fullwidth');
  public submitButton: string = 'Guardar';
  public loading: boolean = false;
  public instalacionesForm!: FormGroup;
  public idInstalacion!: number;
  public title = 'Agregar Instalación';

  loadingDependientes = false;
  listaClientes: any[] = [];
  listaDipositivos: any[] = [];
  listaBlueVox: any[] = [];
  listaVehiculos: any[] = [];
  selectedFileName: string = '';
  previewUrl: string | ArrayBuffer | null = null;

  public idClienteUser!: number;
  public idRolUser!: number;
  get isAdmin(): boolean { return this.idRolUser === 1; }

  private bootstrapping = false;
  private lastLoadedCliente: number | null = null;

  private pendingSelecciones: {
    idDispositivo?: any;
    idBlueVox?: any;
    idVehiculo?: any;
  } = {};

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
    this.obtenerClientes();

    this.activatedRouted.params.subscribe((params) => {
      this.idInstalacion = params['idInstalacion'];
      if (this.idInstalacion) {
        this.title = 'Actualizar Instalación';
        this.obtenerInstalacion();
      }
    });
  }

  initForm() {
    this.instalacionesForm = this.fb.group({
      estatus: [1, Validators.required],
      idCliente: [this.isAdmin ? null : this.idClienteUser, Validators.required],
      idDispositivo: [{ value: null, disabled: true }, Validators.required],
      idBlueVox: [{ value: null, disabled: true }, Validators.required],
      idVehiculo: [{ value: null, disabled: true }, Validators.required],
    });

    if (!this.isAdmin) {
      this.instalacionesForm.get('idCliente')?.disable({ onlySelf: true });
    }
  }

  private toNumOrNull(v: any): number | null {
    return v === undefined || v === null || v === '' || Number.isNaN(Number(v)) ? null : Number(v);
  }

  obtenerInstalacion() {
    this.bootstrapping = true;

    this.instService.obtenerInstalacion(this.idInstalacion).subscribe((response: any) => {
      const raw = Array.isArray(response?.data) ? response.data[0] : response?.data || {};
      if (!raw) { this.bootstrapping = false; return; }

      const idClienteSrv = this.toNumOrNull(raw.idCliente ?? raw?.idCliente2?.id);
      const estatus = this.toNumOrNull(raw.estatus) ?? 1;
      const idDispositivo = this.toNumOrNull(raw.idDispositivo ?? raw?.dispositivos?.id);
      const idBlueVox = this.toNumOrNull(raw.idBlueVox ?? raw?.blueVoxs?.id);
      const idVehiculo = this.toNumOrNull(raw.idVehiculo ?? raw?.vehiculos?.id);
      this.pendingLabels = {
        dispositivo: raw?.numeroSerieDispositivo ?? raw?.numeroSerie ?? null,
        bluevox: raw?.numeroSerieBlueVox ?? raw?.numeroSerie ?? null,
        vehiculo: raw?.placaVehiculo ?? raw?.placa ?? raw?.numeroEconomicoVehiculo ?? null,
      };


      const idCliente = this.isAdmin ? idClienteSrv : this.idClienteUser;

      this.instalacionesForm.patchValue({ idCliente, estatus }, { emitEvent: false });

      this.pendingSelecciones = { idDispositivo, idBlueVox, idVehiculo };

      if (idCliente) {
        this.cargarListasPorCliente(idCliente, true);
      } else {
        this.listaDipositivos = this.ensureSelectedOptionVisible([], idDispositivo, this.pendingLabels.dispositivo, 'numeroSerie');
        this.listaBlueVox = this.ensureSelectedOptionVisible(
          this.listaBlueVox,
          this.pendingSelecciones?.idBlueVox,
          this.pendingLabels.bluevox,
          'numeroSerieBlueVox'
        );
        this.listaVehiculos = this.ensureSelectedOptionVisible([], idVehiculo, this.pendingLabels.vehiculo, 'placa');

        const f = this.instalacionesForm; const opts = { emitEvent: false };
        if (idDispositivo != null) f.get('idDispositivo')?.patchValue(idDispositivo, opts);
        if (idBlueVox != null) f.get('idBlueVox')?.patchValue(idBlueVox, opts);
        if (idVehiculo != null) f.get('idVehiculo')?.patchValue(idVehiculo, opts);

        this.desactivarCamposDependientes(false);
        this.bootstrapping = false;
        this.cdr.detectChanges();
      }
    });
  }

  private desactivarCamposDependientes(disabled: boolean) {
    if (!this.instalacionesForm) return;
    const opts = { emitEvent: false };
    const idDispositivo = this.instalacionesForm.get('idDispositivo');
    const idBlueVox = this.instalacionesForm.get('idBlueVox');
    const idVehiculo = this.instalacionesForm.get('idVehiculo');

    if (disabled) {
      idDispositivo?.disable(opts);
      idBlueVox?.disable(opts);
      idVehiculo?.disable(opts);
    } else {
      idDispositivo?.enable(opts);
      idBlueVox?.enable(opts);
      idVehiculo?.enable(opts);
    }
  }

  private limpiarDependientes() {
    if (!this.instalacionesForm) return;
    const opts = { emitEvent: false };

    this.instalacionesForm.patchValue(
      {
        idDispositivo: null,
        idBlueVox: null,
        idVehiculo: null,
      },
      opts
    );

    this.listaDipositivos = [];
    this.listaBlueVox = [];
    this.listaVehiculos = [];
  }

  private suscribirCambioCliente() {
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

  private cargarListasPorCliente(idCliente: number, applyPending: boolean = false) {
    this.loadingDependientes = true;

    this.limpiarDependientes();
    this.desactivarCamposDependientes(true);

    forkJoin({
      dispositivos: this.dispoService.obtenerDispositivosByCliente(idCliente),
      bluevox: this.blueVoService.obtenerDispositivosBlueByCliente(idCliente),
      vehiculos: this.vehiService.obtenerVehiculosByCliente(idCliente),
    })
      .pipe(finalize(() => (this.loadingDependientes = false)))
      .subscribe({
        next: (resp: any) => {
          const devsRaw = this.ensureArray(resp?.dispositivos ?? resp?.data?.dispositivos);
          const bvxRaw = this.ensureArray(resp?.bluevox ?? resp?.data?.bluevox);
          const vehRaw = this.ensureArray(resp?.vehiculos ?? resp?.data?.vehiculos);

          this.listaDipositivos = this.normalizeId(devsRaw, ['id', 'idDispositivo', 'IdDispositivo', 'IDDispositivo']);
          this.listaBlueVox = this.normalizeId(bvxRaw, ['id', 'idBlueVox', 'IdBlueVox', 'IDBlueVox']);
          this.listaVehiculos = this.normalizeId(vehRaw, ['id', 'idVehiculo', 'IdVehiculo', 'IDVehiculo']);

          this.listaDipositivos = this.ensureSelectedOptionVisible(
            this.listaDipositivos,
            this.pendingSelecciones?.idDispositivo,
            this.pendingLabels.dispositivo,
            'numeroSerie'
          );
          this.listaBlueVox = this.ensureSelectedOptionVisible(
            this.listaBlueVox,
            this.pendingSelecciones?.idBlueVox,
            this.pendingLabels.bluevox,
            'numeroSerie'
          );
          this.listaVehiculos = this.ensureSelectedOptionVisible(
            this.listaVehiculos,
            this.pendingSelecciones?.idVehiculo,
            this.pendingLabels.vehiculo,
            'placa'
          );

          this.desactivarCamposDependientes(false);

          const f = this.instalacionesForm;
          const opts = { emitEvent: false };
          const n = (v: any) => (v == null ? null : Number(v));

          if (applyPending) {
            if (this.pendingSelecciones.idDispositivo != null) f.get('idDispositivo')?.patchValue(n(this.pendingSelecciones.idDispositivo), opts);
            if (this.pendingSelecciones.idBlueVox != null) f.get('idBlueVox')?.patchValue(n(this.pendingSelecciones.idBlueVox), opts);
            if (this.pendingSelecciones.idVehiculo != null) f.get('idVehiculo')?.patchValue(n(this.pendingSelecciones.idVehiculo), opts);
            this.pendingSelecciones = {};
          }

          this.lastLoadedCliente = idCliente;
          this.bootstrapping = false;
          this.cdr.detectChanges();
        },

        error: () => {
          this.limpiarDependientes();
          this.desactivarCamposDependientes(false);
          this.bootstrapping = false;
          this.cdr.detectChanges();
        },
      });
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
    return (arr || []).map((x: any) => ({
      ...x,
      id: Number(this.pickId(x, keys)),
    }));
  }

  obtenerClientes() {
    this.clieService.obtenerClientes().subscribe((response: any) => {
      this.listaClientes = this.normalizeId(response?.data);

      if (!this.idInstalacion && !this.isAdmin) {
        this.instalacionesForm.get('idCliente')?.setValue(this.idClienteUser, { emitEvent: false });
        this.cargarListasPorCliente(this.idClienteUser, false);
      }
    });
  }

  submit() {
    if (this.loading) return;            // evita doble clic
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
      idDispositivo: 'Dispositivo',
      idBlueVox: 'Bluevox',
      idVehiculo: 'Vehículo',
      idCliente: 'Cliente',
    };
    const requeridos = ['idDispositivo', 'idBlueVox', 'idVehiculo', 'idCliente'];
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
    // === FIN VALIDACIÓN ===

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

    // === VALIDACIÓN SIN MÉTODOS NUEVOS (cuenta disabled) ===
    const etiquetas: any = {
      idDispositivo: 'Dispositivo',
      idBlueVox: 'Bluevox',
      idVehiculo: 'Vehículo',
      idCliente: 'Cliente',
    };
    const requeridos = ['idDispositivo', 'idBlueVox', 'idVehiculo', 'idCliente'];
    const raw = this.instalacionesForm.getRawValue();
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
    // === FIN VALIDACIÓN ===

    const payload = this.instalacionesForm.getRawValue();

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

  private pendingLabels: {
    dispositivo?: string | null;
    bluevox?: string | null;
    vehiculo?: string | null;
  } = {};

  private ensureSelectedOptionVisible(
    list: any[],
    selectedId: number | null | undefined,
    displayLabel: string | null | undefined,
    labelField: string
  ) {
    const id = selectedId == null ? null : Number(selectedId);
    if (id == null) return list;

    const exists = list.some(x => Number(x.id) === id);
    if (!exists) {
      list.unshift({
        id,
        [labelField]: displayLabel || String(id)
      });
    }
    return list;
  }

  compareId = (a: any, b: any) =>
    a != null && b != null && Number(a) === Number(b);

  trackId = (_: number, item: any) => Number(item?.id);

  regresar() {
    this.route.navigateByUrl('/administracion/instalaciones');
  }

}
