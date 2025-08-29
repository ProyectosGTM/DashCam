import {
  Component,
  OnInit,
  ViewChild,
  DestroyRef,
  inject,
  Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { VexPageLayoutComponent } from '@vex/components/vex-page-layout/vex-page-layout.component';
import { VexPageLayoutHeaderDirective } from '@vex/components/vex-page-layout/vex-page-layout-header.directive';
import { VexBreadcrumbsComponent } from '@vex/components/vex-breadcrumbs/vex-breadcrumbs.component';
import { VexPageLayoutContentDirective } from '@vex/components/vex-page-layout/vex-page-layout-content.directive';

import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular';
import { fadeInRight400ms } from '@vex/animations/fade-in-right.animation';

declare const google: any;


export interface PerfilUsuario {
  nombre: string;
  rol: string;
  descripcion: string;
  telefono: string;
  correo: string;
  avatarUrl?: string | null;
}

@Component({
  selector: 'vex-perfil-usuario',
  standalone: true,
  templateUrl: './perfil-usuario.component.html',
  styleUrl: './perfil-usuario.component.scss',
  animations: [fadeInRight400ms],
  imports: [
    CommonModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatPaginatorModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    DxDataGridModule
  ]
})
export class PerfilUsuarioComponent implements OnInit {

  public usuario: any;
  public estadisticas: any;

  @Input() data: PerfilUsuario = {
    nombre: 'Admin',
    rol: 'Administrador',
    descripcion: 'Gestor de Sistemas — Acceso Completo',
    telefono: '+52 55 1234 5678',
    correo: 'admin@empresa.com',
    avatarUrl: null
  };

  get siglas(): string {
    const n = (this.data?.nombre || 'U').trim();
    return n.split(' ').filter(Boolean).slice(0, 2).map(s => s[0]!.toUpperCase()).join('');
  }

  onCambiarContrasena() {}
  onEditarPerfil() {}
  
  constructor(
  ) {
  }

  ngOnInit(): void {
  }

  
}
