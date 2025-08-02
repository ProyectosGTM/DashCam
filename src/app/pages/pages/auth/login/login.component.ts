import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { fadeInUp400ms } from '@vex/animations/fade-in-up.animation';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Credentials } from 'src/app/entities/Credentials';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { User } from 'src/app/entities/User';

@Component({
  selector: 'vex-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInUp400ms],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatCheckboxModule,
    RouterLink,
    MatSnackBarModule
  ]
})
export class LoginComponent implements OnInit {
  form = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  inputType = 'password';
  visible = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    private auth: AuthenticationService,
  ) {
    this.loginForm = this.fb.group({
    email: [''],
    password: ['']
  });

  this.credentials = {};
  }

  ngOnInit(): void {
      this.initForm();
  }

  send() {
    this.router.navigate(['/']);
    this.snackbar.open(
      "Lucky you! Looks like you didn't need a password or email address! For a real application we provide validators to prevent this. ;)",
      'THANKS',
      {
        duration: 10000
      }
    );
  }

  toggleVisibility() {
    if (this.visible) {
      this.inputType = 'password';
      this.visible = false;
      this.cd.markForCheck();
    } else {
      this.inputType = 'text';
      this.visible = true;
      this.cd.markForCheck();
    }
  }

  initForm() {
    this.loginForm = this.fb.group({
      UserName: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required]],
      // email: ['admin@themesbrand.com', [Validators.required, Validators.email]],
      // password: ['123456', [Validators.required]],
    });
  }

  public textLogin: string = 'Iniciar Sesión';
  public loading: boolean = false;
  public loginForm: UntypedFormGroup;
  public credentials: Credentials;
   onSubmit() {
    this.loading = true;
    this.textLogin = 'Cargando...';
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Para un desplazamiento suave
    });
    // this.loading = true;
    this.credentials = this.loginForm.value;
    
    this.auth.authenticate(this.credentials).pipe(
      catchError((error) => {
        this.loading = false;
        this.textLogin = 'Iniciar Sesión';
        Swal.fire({
  title: "Good job!",
  text: "You clicked the button!",
  icon: "success"
});
        return throwError(() => "")
      })
      ).subscribe((result: User) => {
        setTimeout(()=> {
          this.auth.setData(result);
    
          this.router.navigate(['/administracion/dispositivos']);
          const nombreUsuario = result.nombre;
          const apellidoUsuario = result.apellidoPaterno;
      
          Swal.fire({
  title: "Good job!",
  text: "You clicked the button!",
  icon: "success"
});
      
          this.loading = false;
          this.textLogin = 'Iniciar Sesión';
        },700)
    });
    // this.auth.authenticate(this.credentials).subscribe(
    //   (result: User) => {
    //     this.auth.setData(result);
    //     this.router.navigate(['']);
    //   },
    //   err=>{
    //     console.log(err);
    //     // this.toastr.error('Usuario o contraseña incorrectos')
    //   })
  }
}
