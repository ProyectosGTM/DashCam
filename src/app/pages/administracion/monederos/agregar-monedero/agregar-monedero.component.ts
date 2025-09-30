import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { AlertsService } from 'src/app/pages/pages/modal/alerts.service';

@Component({
  selector: 'vex-agregar-monedero',
  templateUrl: './agregar-monedero.component.html',
  styleUrl: './agregar-monedero.component.scss',
  animations: [fadeInRight400ms],
})
export class AgregarMonederoComponent implements OnInit {



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
  ) { }

  ngOnInit(): void {
    this.initForm();
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
    );
  }

  regresar() {
    this.router.navigateByUrl('/administracion/operadores')
  }

}
