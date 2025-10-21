import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';
import { ClientesService } from 'src/app/pages/services/clientes.service';
import { InstalacionesService } from 'src/app/pages/services/instalaciones.service';
import { OperadoresService } from 'src/app/pages/services/operadores.service';
import { TurnoService } from 'src/app/pages/services/turnos.service';

@Component({
  selector: 'vex-agregar-turno',
  templateUrl: './agregar-turno.component.html',
  styleUrl: './agregar-turno.component.scss',
  animations: [fadeInRight400ms],
})
export class AgregarTurnoComponent implements OnInit {

  layoutCtrl = new UntypedFormControl('fullwidth');
    public submitButton: string = 'Guardar';
    public loading: boolean = false;
    public turnoForm!: FormGroup;
    public idTurno!: number;
    public title = 'Agregar Turno';
    public listaClientes: any[] = [];
    selectedFileName: string = '';
    previewUrl: string | ArrayBuffer | null = null;
    listaOperadores: any[] = [];
    listaBlueVox: any[] = [];
    listaInstalaciones: any[] = [];
  
    constructor(
      private fb: FormBuilder,
      private turnService: TurnoService,
      private activatedRouted: ActivatedRoute,
      private router: Router,
      private alerts: AlertsService,
      private clieService: ClientesService,
    private operaService: OperadoresService,
    private instService: InstalacionesService,
    ) { }
  
    ngOnInit(): void {
      // this.obtenerClientes()
      this.obtenerClientes();
    this.obtenerOperador();
    this.obtenerInstalaciones();
      this.initForm();
      this.activatedRouted.params.subscribe((params) => {
      this.idTurno = params['idTurno'];
      if (this.idTurno) {
        this.title = 'Actualizar Turno';
        this.obtenerTurno();
      }
    });
    }

      private normalizeId<T extends { id: any }>(arr: T[] = []): (T & { id: number })[] {
    return (arr || []).map((x: any) => ({ ...x, id: Number(x.id) }));
  }
      obtenerInstalaciones() {
    this.instService.obtenerInstalaciones().subscribe((response) => {
      this.listaInstalaciones = this.normalizeId(response?.data ?? []);
    });
  }

  obtenerClientes() {
    this.clieService.obtenerClientes().subscribe((response: any) => {
      this.listaClientes = this.normalizeId(response?.data ?? []);
    });
  }

  obtenerOperador() {
    this.operaService.obtenerOperadores().subscribe((response: any) => {
      const operadores = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      this.listaOperadores = operadores.map((op: any) => ({
        id: Number(op.id),
        nombreUsuario: op.nombreUsuario ?? '',
        apellidoPaternoUsuario: op.apellidoPaternoUsuario ?? '',
        apellidoMaternoUsuario: op.apellidoMaternoUsuario ?? '',
      }));
    });
  }
    
  private toInputDatetime(z: string | null | undefined): string | null {
    if (!z) return null;
    return String(z).replace('Z', '').slice(0, 16);
  }
  
  obtenerTurno() {
    this.turnService.obtenerTurno(this.idTurno).subscribe((response: any) => {
      const turno = Array.isArray(response?.data) ? response.data[0] : response?.data;
      if (!turno) return;

      const idClienteSrv   = turno.idCliente     != null ? Number(turno.idCliente)     : null;
      const idOperador     = turno.idOperador    != null ? Number(turno.idOperador)    : null;
      const idInstalacion  = turno.idInstalacion != null ? Number(turno.idInstalacion) : null;


      this.turnoForm.patchValue({
        inicio: this.toInputDatetime(turno.inicio),
        fin: this.toInputDatetime(turno.fin),
        idClienteSrv,
        idOperador,
        idInstalacion,
        estatus: turno.estatus ?? 1,
      }, { emitEvent: false });

    });
  }
  
  initForm() {
    this.turnoForm = this.fb.group({
      inicio: ['', Validators.required],
      fin: ['', Validators.required],
      estatus: [1, Validators.required],
      idCliente: [null, Validators.required],
      idOperador: [null, Validators.required],
      idInstalacion: [null, Validators.required],
    });
  }
  
    submit() {
      this.submitButton = 'Cargando...';
      this.loading = true;
      if (this.idTurno) {
        this.actualizar();
      } else {
        this.agregar();
      }
    }
  
    async agregar() {
      this.submitButton = 'Cargando...';
      this.loading = true;
  
      if (this.turnoForm.invalid) {
        this.submitButton = 'Guardar';
        this.loading = false;
  
              const etiquetas: any = {
        inicio: 'Inicio del Turno',
        fin: 'Fin del Turno',
        idCliente: 'Cliente',
        idOperador: 'Operador',
        idInstalacion: 'Instalación',
      };
  
        const camposFaltantes: string[] = [];
        Object.keys(this.turnoForm.controls).forEach((key) => {
          const control = this.turnoForm.get(key);
          if (control?.invalid && control.errors?.['required']) {
            camposFaltantes.push(etiquetas[key] || key);
          }
        });
  
        const lista = camposFaltantes
          .map(
            (campo, index) => `
          <div style="padding: 8px 12px; border-left: 4px solid #d9534f;
                      background: #caa8a8; text-align: center; margin-bottom: 8px;
                      border-radius: 4px;">
            <strong style="color: #b02a37;">${index + 1}. ${campo}</strong>
          </div>`
          )
          .join('');
  
        await this.alerts.open({
          type: 'warning',
          title: '¡Ops!',
          message: `
          <p style="text-align: center; font-size: 15px; margin-bottom: 16px; color: white">
            Hay campos obligatorios sin completar.<br>
          </p>
          <div style="max-height: 350px; overflow-y: auto;">${lista}</div>
        `,
          confirmText: 'Entendido',
          backdropClose: false,
        });
        return;
      }
  
      // quitar id antes de enviar (consistencia con otros módulos)
      if (this.turnoForm.contains('id')) this.turnoForm.removeControl('id');
  
      const payload = this.turnoForm.getRawValue();
  
      this.turnService.agregarTurno(payload).subscribe(
        () => {
          this.submitButton = 'Guardar';
          this.loading = false;
  
          this.alerts.open({
            type: 'success',
            title: '¡Operación Exitosa!',
            message: 'Se agregó un nuevo turno de manera exitosa.',
            confirmText: 'Confirmar',
            backdropClose: false,
          });
  
          this.regresar();
        },
        (error) => {
          this.submitButton = 'Guardar';
          this.loading = false;
  
          this.alerts.open({
            type: 'error',
            title: '¡Ops!',
            message: String(error ?? 'Ocurrió un error al agregar el turno.'),
            confirmText: 'Confirmar',
            backdropClose: false,
          });
        }
      );
    }
  
    async actualizar() {
      this.submitButton = 'Cargando...';
      this.loading = true;
  
      if (this.turnoForm.invalid) {
        this.submitButton = 'Guardar';
        this.loading = false;
  
              const etiquetas: any = {
        inicio: 'Inicio del Turno',
        fin: 'Fin del Turno',
        idCliente: 'Cliente',
        idOperador: 'Operador',
        idInstalacion: 'Instalación',
      };
  
        const camposFaltantes: string[] = [];
        Object.keys(this.turnoForm.controls).forEach((key) => {
          const control = this.turnoForm.get(key);
          if (control?.invalid && control.errors?.['required']) {
            camposFaltantes.push(etiquetas[key] || key);
          }
        });
  
        const lista = camposFaltantes
          .map(
            (campo, index) => `
          <div style="padding: 8px 12px; border-left: 4px solid #d9534f;
                      background: #caa8a8; text-align: center; margin-bottom: 8px;
                      border-radius: 4px;">
            <strong style="color: #b02a37;">${index + 1}. ${campo}</strong>
          </div>`
          )
          .join('');
  
        await this.alerts.open({
          type: 'warning',
          title: '¡Ops!',
          message: `
          <p style="text-align: center; font-size: 15px; margin-bottom: 16px; color: white">
            Hay campos obligatorios sin completar.<br>
          </p>
          <div style="max-height: 350px; overflow-y: auto;">${lista}</div>
        `,
          confirmText: 'Entendido',
          backdropClose: false,
        });
        return; // salir si es inválido
      }
  
      const payload = this.turnoForm.getRawValue();
  
      this.turnService.actualizarTurno(this.idTurno, payload).subscribe(
        () => {
          this.submitButton = 'Actualizar';
          this.loading = false;
  
          this.alerts.open({
            type: 'success',
            title: '¡Operación Exitosa!',
            message: 'Los datos del turno se actualizaron correctamente.',
            confirmText: 'Confirmar',
            backdropClose: false,
          });
  
          this.regresar();
        },
        (error) => {
          this.submitButton = 'Actualizar';
          this.loading = false;
  
          this.alerts.open({
            type: 'error',
            title: '¡Ops!',
            message: String(error ?? 'Ocurrió un error al actualizar el turno.'),
            confirmText: 'Confirmar',
            backdropClose: false,
          });
        }
      );
    }
  
  
    regresar() {
      this.router.navigateByUrl('/administracion/turnos')
    }
  

}
