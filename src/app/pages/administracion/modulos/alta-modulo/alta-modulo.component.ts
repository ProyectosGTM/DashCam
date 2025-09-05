import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';

@Component({
  selector: 'vex-alta-modulo',
  templateUrl: './alta-modulo.component.html',
  styleUrl: './alta-modulo.component.scss',
  animations: [fadeInRight400ms],
})
export class AltaModuloComponent implements OnInit {
  layoutCtrl = new UntypedFormControl('fullwidth');
  form: FormGroup;
  saving = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      responsable: ['', Validators.required],
      descripcion: [''],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      estado: ['activo', Validators.required],
      fecha: [''],
      hora: [''],
      url: [''],
      color: ['#0d6efd'],
      visible: [true],
      tags: [''] // "a,b,c" -> lo convertimos a arreglo en el submit
    });
  }

  get tagsArray(): string[] {
    const raw = (this.form.value.tags || '') as string;
    return raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  isInvalid(ctrl: string): boolean {
    const c = this.form.get(ctrl);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;

    // Payload listo para API
    const payload = {
      ...this.form.value,
      tags: this.tagsArray
    };

    // Simula llamada a API
    setTimeout(() => {
      console.log('✅ Enviado', payload);
      this.saving = false;
      alert('Módulo guardado correctamente');
      this.form.reset({
        estado: 'activo',
        color: '#0d6efd',
        visible: true
      });
    }, 900);
  }

  onReset(): void {
    this.form.reset({
      estado: 'activo',
      color: '#0d6efd',
      visible: true
    });
  }

  onFillDemo(): void {
    this.form.patchValue({
      nombre: 'Monitoreo',
      responsable: 'María López',
      descripcion: 'Panel para visualizar unidades en tiempo real.',
      email: 'soporte@empresa.com',
      telefono: '+52 55 1234 5678',
      estado: 'activo',
      fecha: new Date().toISOString().slice(0, 10),
      hora: '09:00',
      url: 'https://app.empresa.com/monitoreo',
      color: '#16a34a',
      visible: true,
      tags: 'gps, mapa, unidades'
    });
  }

  ngOnInit(): void {
      
  }
  
}
