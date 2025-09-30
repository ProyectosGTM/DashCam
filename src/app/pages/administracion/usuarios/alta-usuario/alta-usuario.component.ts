import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, UntypedFormControl, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';

@Component({
  selector: 'vex-alta-usuario',
  templateUrl: './alta-usuario.component.html',
  styleUrl: './alta-usuario.component.scss',
  animations: [fadeInRight400ms],
})
export class AltaUsuarioComponent {
  layoutCtrl = new UntypedFormControl('fullwidth');
    isLoading: boolean = false;
    
  usuarioForm!: FormGroup;
  hidePass = true;
  hidePass2 = true;

  roles: any[] = [];
  clientes: any[] = [];

  loading = false;
  submitButton = 'Guardar';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alerts: AlertsService,
    // Inyecta tus servicios reales
    // private usuariosService: UsuariosService,
    // private catalogosService: CatalogosService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.cargarCatalogos();
  }

  regresar(){
    this.router.navigateByUrl('/administracion/usuarios')
  }

  private initForm(): void {
    this.usuarioForm = this.fb.group(
      {
        userName: ['', [Validators.required, Validators.email]],
        telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        nombre: ['', [Validators.required]],
        apellidoPaterno: [''],
        apellidoMaterno: [''],
        passwordHash: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        idRol: [null, [Validators.required]],
        estatus: [1, [Validators.required]],
        idCliente: [null, [Validators.required]],
        permiteCobro: [false]
      },
      { validators: this.passwordsIgualesValidator }
    );
  }

  private passwordsIgualesValidator(group: AbstractControl): ValidationErrors | null {
    const p1 = group.get('passwordHash')?.value ?? '';
    const p2 = group.get('confirmPassword')?.value ?? '';
    return p1 && p2 && p1 !== p2 ? { passwordMismatch: true } : null;
  }

  private cargarCatalogos(): void {
    this.loading = true;
    // Reemplaza por tus observables reales:
    // const obsRoles = this.catalogosService.obtenerRoles();
    // const obsClientes = this.catalogosService.obtenerClientes();
    const obsRoles = Promise.resolve([{ id: 1, nombre: 'Administrador' }, { id: 2, nombre: 'Operador' }]);
    const obsClientes = Promise.resolve([{ id: 10, nombre: 'Cliente A' }, { id: 11, nombre: 'Cliente B' }]);

    Promise.all([obsRoles, obsClientes])
      .then(([r, c]) => {
        this.roles = r as any[];
        this.clientes = c as any[];
      })
      .catch(() => {
        this.alerts.open({
          type: 'error',
          title: 'Error',
          message: 'No se pudieron cargar catálogos',
          backdropClose: false
        });
      })
      .finally(() => (this.loading = false));
  }

  limpiarCampos(): void {
    this.usuarioForm.reset({
      userName: '',
      telefono: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      passwordHash: '',
      confirmPassword: '',
      idRol: null,
      estatus: 1,
      idCliente: null,
      permiteCobro: false
    });
    this.usuarioForm.markAsPristine();
    this.usuarioForm.markAsUntouched();
  }

  private camposRequeridosFaltantes(): string[] {
    const etiquetas: Record<string, string> = {
      userName: 'Correo electrónico',
      telefono: 'Teléfono',
      nombre: 'Nombre',
      passwordHash: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      idRol: 'Rol',
      estatus: 'Estatus',
      idCliente: 'Cliente'
    };
    const faltantes: string[] = [];
    Object.keys(this.usuarioForm.controls).forEach((key) => {
      const c = this.usuarioForm.get(key);
      if (c?.errors?.['required']) faltantes.push(etiquetas[key] || key);
    });
    if (this.usuarioForm.hasError('passwordMismatch')) faltantes.push('Las contraseñas no coinciden');
    if (this.usuarioForm.get('telefono')?.errors?.['pattern']) faltantes.push('Teléfono debe tener 10 dígitos');
    if (this.usuarioForm.get('userName')?.errors?.['email']) faltantes.push('Correo electrónico inválido');
    if (this.usuarioForm.get('passwordHash')?.errors?.['minlength']) faltantes.push('Contraseña mínimo 8 caracteres');
    return faltantes;
  }

  async guardar(): Promise<void> {
    if (this.loading) return;
    this.usuarioForm.markAllAsTouched();

    if (this.usuarioForm.invalid) {
      const mensajes = this.camposRequeridosFaltantes();
      await this.alerts.open({
        type: 'error',
        title: 'Campos pendientes',
        message: mensajes.length ? mensajes.join('<br>') : 'Revisa la información del formulario',
        backdropClose: false
      });
      return;
    }

    const payload = {
      userName: String(this.usuarioForm.value.userName).trim(),
      telefono: String(this.usuarioForm.value.telefono).trim(),
      nombre: String(this.usuarioForm.value.nombre).trim(),
      apellidoPaterno: String(this.usuarioForm.value.apellidoPaterno || '').trim(),
      apellidoMaterno: String(this.usuarioForm.value.apellidoMaterno || '').trim(),
      passwordHash: this.usuarioForm.value.passwordHash,
      idRol: Number(this.usuarioForm.value.idRol),
      estatus: Number(this.usuarioForm.value.estatus),
      idCliente: Number(this.usuarioForm.value.idCliente),
      permiteCobro: !!this.usuarioForm.value.permiteCobro
    };

    this.loading = true;
    this.submitButton = 'Guardando...';

    try {
      // const resp = await lastValueFrom(this.usuariosService.crearUsuario(payload));
      await new Promise((res) => setTimeout(res, 600));

      await this.alerts.open({
        type: 'success',
        title: 'Usuario guardado',
        message: 'El registro se creó correctamente.',
        navigateAfterClose: '/app/usuarios',
        navigateDelayMs: 200
      });
    } catch (e: any) {
      await this.alerts.open({
        type: 'error',
        title: 'Error al guardar',
        message: e?.message || 'No se pudo guardar el usuario.',
        backdropClose: false
      });
    } finally {
      this.loading = false;
      this.submitButton = 'Guardar';
    }
  }

  async cancelar(): Promise<void> {
    const r = await this.alerts.open({
      type: 'warning',
      title: 'Cancelar',
      message: '¿Deseas cancelar y descartar cambios?',
      // Ejemplo de confirm/cancel con promesa si tu AlertsService lo maneja:
      // buttons: [{action: 'confirm', label: 'Sí'}, {action: 'cancel', label: 'No'}]
    });
    // Si tu AlertsService devuelve algo como 'confirm'/'cancel', manéjalo así:
    if (String(r).toLowerCase() === 'confirm') this.router.navigate(['/app/usuarios']);
  }

   previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  isDragOver: boolean = false;

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.loadFile(input.files[0]);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.loadFile(event.dataTransfer.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  private loadFile(file: File): void {
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

}
