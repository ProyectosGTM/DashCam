import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';
import { RutasService } from 'src/app/pages/services/ruta.service';
import { ZonasService } from 'src/app/pages/services/zonas.service';

@Component({
  selector: 'vex-agregar-ruta',
  templateUrl: './agregar-ruta.component.html',
  styleUrl: './agregar-ruta.component.scss',
  animations: [fadeInRight400ms],
})
export class AgregarRutaComponent implements OnInit {
  layoutCtrl = new UntypedFormControl('fullwidth');
  title = 'Agregar Ruta';
  rutaForm!: FormGroup;
  listaRegiones: any;
  public submitButton: string = 'Guardar';
  public loading: boolean = false;
  puntosCompletos = false;

  private readonly centroToluca: google.maps.LatLngLiteral = { lat: 19.2879, lng: -99.6468 };

  constructor(
    private fb: FormBuilder,
    private zonService: ZonasService,
    private rutService: RutasService,
    private ngZone: NgZone,
    private route: Router,
  ) { }


  ngOnInit(): void {
    this.rutaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(200)]],
      idRegion: [null, Validators.required],
      estatus: [1, Validators.required],
    });

    this.obtenerRegiones();
  }

  obtenerRegiones(): void {
    this.zonService.obtenerZonas().subscribe((response) => {
      this.listaRegiones = response?.data ?? [];
    });
  }

  regresar() {
    this.route.navigateByUrl('/administracion/rutas')
  }


}
