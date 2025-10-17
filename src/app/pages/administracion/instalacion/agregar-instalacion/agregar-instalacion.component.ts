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
  listaValidadores: any[] = [];
  listaContadores: any[] = [];
  listaVehiculos: any[] = [];
  selectedFileName: string = '';
  previewUrl: string | ArrayBuffer | null = null;

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
  }

  ngOnInit(): void {
    this.initForm();
    this.obtenerClientes();
    this.obtenerValidadores()
    this.obtenerContadores()
    this.obtenerVehiculos()

    this.activatedRouted.params.subscribe((params) => {
      this.idInstalacion = params['idInstalacion'];
      if (this.idInstalacion) {
        this.title = 'Actualizar Instalación';
        this.obtenerInstalacion();
      }
    });
  }

  obtenerClientes() {
    this.clieService.obtenerClientes().subscribe((res: any) => {
      const data = res?.data ?? [];
      this.listaClientes = data.map(this.normalizeCliente);
    });
  }

  obtenerValidadores() {
    this.dispoService.obtenerDispositivos().subscribe((res: any) => {
      const data = res?.data ?? [];
      this.listaValidadores = data.map(this.normalizeValidador);
    });
  }

  obtenerContadores() {
    this.blueVoService.obtenerDispositivosBlue().subscribe((res: any) => {
      const data = res?.data ?? [];
      this.listaContadores = data.map(this.normalizeContador);
    });
  }

  obtenerVehiculos() {
    this.vehiService.obtenerVehiculos().subscribe((res: any) => {
      const data = res?.data ?? [];
      this.listaVehiculos = data.map(this.normalizeVehiculo);
    });
  }

  obtenerInstalacion() {
    this.instService.obtenerInstalacion(this.idInstalacion).subscribe((response: any) => {
      const d = Array.isArray(response?.data) ? response.data[0] : (response?.data ?? {});

      const idCliente = this.num(d?.idCliente);
      const idValidador = this.num(d?.idValidador ?? d?.idValidadores); // por si viene plural
      const idContador = this.num(d?.idContador ?? d?.idContadores);
      const idVehiculo = this.num(d?.idVehiculo);

      // 1) Parchea el formulario
      this.instalacionesForm.patchValue({
        estatus: this.num(d?.estatus),
        idCliente: idCliente,
        idValidador: idValidador,
        idContador: idContador,
        idVehiculo: idVehiculo,
      }, { emitEvent: false });

      // 2) Asegura que exista la opción seleccionada en cada lista (si no vino en catálogos)
      if (idValidador && !this.listaValidadores.some(x => +x.id === +idValidador)) {
        this.listaValidadores.push(this.normalizeValidador({
          idValidador,
          id: idValidador,
          numeroSerie: d?.numeroSerieValidadores ?? d?.numeroSerieValidador ?? '—',
          marca: d?.marcaValidadores ?? d?.marcaValidador ?? '—',
          modelo: d?.modeloValidadores ?? d?.modeloValidador ?? '—',
        }));
      }

      if (idContador && !this.listaContadores.some(x => +x.id === +idContador)) {
        this.listaContadores.push(this.normalizeContador({
          idContador,
          id: idContador,
          numeroSerie: d?.numeroSerieContadores ?? d?.numeroSerieContador ?? '—',
          marca: d?.marcaContadores ?? d?.marcaContador ?? '—',
          modelo: d?.modeloContadores ?? d?.modeloContador ?? '—',
        }));
      }

      if (idVehiculo && !this.listaVehiculos.some(x => +x.id === +idVehiculo)) {
        this.listaVehiculos.push(this.normalizeVehiculo({
          idVehiculo,
          id: idVehiculo,
          placa: d?.placaVehiculo ?? '—',
          numeroEconomico: d?.numeroEconomicoVehiculo ?? '—',
          marcaVehiculo: d?.marcaVehiculo,
          modeloVehiculo: d?.modeloVehiculo,
        }));
      }

      // (Cliente normalmente sí viene en catálogo; si no, puedes hacer lo mismo)
      if (idCliente && !this.listaClientes.some(x => +x.id === +idCliente)) {
        this.listaClientes.push(this.normalizeCliente({
          idCliente,
          id: idCliente,
          nombreCliente: d?.nombreCliente ?? 'Cliente (actual)',
        }));
      }
    });
  }



  private num = (v: any) => (v === null || v === undefined || v === '' ? null : +v);

  // Normaliza y fuerza IDs a number
  private normalizeCliente = (c: any) => ({
    ...c,
    id: this.num(c.idCliente ?? c.id),
  });

  private normalizeValidador = (d: any) => ({
    ...d,
    id: this.num(d.idValidador ?? d.id),
  });

  private normalizeContador = (b: any) => ({
    ...b,
    id: this.num(b.idContador ?? b.id),
  });

  private normalizeVehiculo = (v: any) => ({
    ...v,
    id: this.num(v.idVehiculo ?? v.id),
  });


  initForm() {
    this.instalacionesForm = this.fb.group({
      estatus: [1, Validators.required],
      idCliente: [null, Validators.required],
      idValidador: [null, Validators.required],
      idContador: [null, Validators.required],
      idVehiculo: [null, Validators.required],
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

  regresar() {
    this.route.navigateByUrl('/administracion/instalaciones');
  }
}
