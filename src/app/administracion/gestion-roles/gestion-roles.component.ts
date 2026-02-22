import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RolService } from '../../core/services/rol.service';
import { NotificationService } from '../../core/services/notification.service';
import { Rol } from '../../shared/models/models';

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatCheckboxModule,
    MatChipsModule,
    MatCardModule,
    MatTooltipModule
  ],
  templateUrl: './gestion-roles.component.html',
  styleUrl: './gestion-roles.component.scss'
})
export class GestionRolesComponent implements OnInit {
  roles: Rol[] = [];
  formularioRol: FormGroup;
  mostrarFormulario = false;
  editandoRol: Rol | null = null;
  permisosDisponibles: string[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'permisosCount', 'activo', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private rolService: RolService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {
    this.formularioRol = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      permisos: [[]],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.cargarRoles();
    this.permisosDisponibles = this.rolService.getPermisosDisponibles();
  }

  cargarRoles(): void {
    this.rolService.obtenerTodos().subscribe({
      next: (roles: Rol[]) => {
        this.roles = roles;
        this.notificationService.success('Roles cargados correctamente');
      },
      error: (error: any) => {
        console.error('Error al cargar roles:', error);
        this.notificationService.error('Error al cargar los roles');
      }
    });
  }

  abrirFormulario(rol?: Rol) {
    this.mostrarFormulario = true;
    if (rol) {
      this.editandoRol = rol;
      this.formularioRol.patchValue({
        nombre: rol.nombre,
        descripcion: rol.descripcion,
        permisos: rol.permisos,
        activo: rol.activo
      });
    } else {
      this.editandoRol = null;
      this.formularioRol.reset({ activo: true });
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.editandoRol = null;
    this.formularioRol.reset({ activo: true });
  }

  guardarRol(): void {
    if (this.formularioRol.invalid) {
      this.notificationService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    const datosRol = {
      ...this.formularioRol.value,
      id: this.editandoRol?.id || Date.now(),
      createdAt: this.editandoRol?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (this.editandoRol) {
      this.rolService.actualizar(this.editandoRol.id, datosRol).subscribe({
        next: () => {
          this.notificationService.success('Rol actualizado correctamente');
          this.cargarRoles();
          this.cerrarFormulario();
        },
        error: (error: any) => {
          console.error('Error al actualizar rol:', error);
          this.notificationService.error('Error al actualizar el rol');
        }
      });
    } else {
      this.rolService.crear(datosRol).subscribe({
        next: () => {
          this.notificationService.success('Rol creado correctamente');
          this.cargarRoles();
          this.cerrarFormulario();
        },
        error: (error: any) => {
          console.error('Error al crear rol:', error);
          this.notificationService.error('Error al crear el rol');
        }
      });
    }
  }

  eliminarRol(rol: Rol): void {
    if (confirm(`¿Está seguro de que desea eliminar el rol "${rol.nombre}"?`)) {
      this.rolService.eliminar(rol.id).subscribe({
        next: () => {
          this.notificationService.success('Rol eliminado correctamente');
          this.cargarRoles();
        },
        error: (error: any) => {
          console.error('Error al eliminar rol:', error);
          this.notificationService.error('Error al eliminar el rol');
        }
      });
    }
  }

  alternarPermiso(permiso: string): void {
    const permisos = this.formularioRol.get('permisos')?.value || [];
    const index = permisos.indexOf(permiso);
    if (index > -1) {
      permisos.splice(index, 1);
    } else {
      permisos.push(permiso);
    }
    this.formularioRol.get('permisos')?.setValue([...permisos]);
  }

  tienePermiso(permiso: string): boolean {
    const permisos = this.formularioRol.get('permisos')?.value || [];
    return permisos.includes(permiso);
  }

  obtenerPermisosTexto(rol: Rol): string {
    return rol.permisos.slice(0, 2).join(', ') + (rol.permisos.length > 2 ? '...' : '');
  }
}
