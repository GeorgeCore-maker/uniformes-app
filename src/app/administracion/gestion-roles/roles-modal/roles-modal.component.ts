import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Rol } from '../../../shared/models/models';
import { RolService } from '../../../core/services/rol.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedModule } from '../../../shared/shared.module';


@Component({
  selector: 'app-roles-modal',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './roles-modal.component.html',
  styleUrls: ['./roles-modal.component.scss']
})
export class RolesModalComponent implements OnInit {
  formularioRol: FormGroup;
  editando = false;
  permisosDisponibles: string[] = [];
  permisosSeleccionados: string[] = [];

  constructor(
    private fb: FormBuilder,
    private rolService: RolService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<RolesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rol?: Rol }
  ) {
    this.editando = !!data?.rol;
    this.formularioRol = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: [''],
      activo: [true]
    });
  }

  ngOnInit() {
    this.cargarPermisosDisponibles();
    if (this.data?.rol) {
      this.cargarDatosRol();
    }
  }

  cargarPermisosDisponibles(): void {
    this.permisosDisponibles = this.rolService.getPermisosDisponibles();
  }

  cargarDatosRol(): void {
    if (this.data.rol) {
      this.formularioRol.patchValue({
        nombre: this.data.rol.nombre,
        descripcion: this.data.rol.descripcion,
        activo: this.data.rol.activo
      });
      this.permisosSeleccionados = [...this.data.rol.permisos];
    }
  }

  togglePermiso(permiso: string): void {
    const index = this.permisosSeleccionados.indexOf(permiso);
    if (index >= 0) {
      this.permisosSeleccionados.splice(index, 1);
    } else {
      this.permisosSeleccionados.push(permiso);
    }
  }

  isPermisoSeleccionado(permiso: string): boolean {
    return this.permisosSeleccionados.includes(permiso);
  }

  guardarRol(): void {
    if (this.formularioRol.invalid) {
      this.notificationService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    const formValue = this.formularioRol.value;

    const datosRol: any = {
      nombre: formValue.nombre.toUpperCase(),
      descripcion: formValue.descripcion,
      permisos: [...this.permisosSeleccionados],
      activo: formValue.activo,
      habilitado: true,
      updatedAt: new Date().toISOString()
    };

    if (this.editando && this.data.rol) {
      // Actualizar rol existente
      this.rolService.actualizar(this.data.rol.id, datosRol).subscribe({
        next: (rol) => {
          this.notificationService.success('Rol actualizado correctamente');
          this.dialogRef.close(rol);
        },
        error: (error: any) => {
          console.error('Error al actualizar rol:', error);
          this.notificationService.error('Error al actualizar el rol');
        }
      });
    } else {
      // Crear nuevo rol
      datosRol.id = Date.now();
      datosRol.createdAt = new Date().toISOString();

      this.rolService.crear(datosRol).subscribe({
        next: (rol) => {
          this.notificationService.success('Rol creado correctamente');
          this.dialogRef.close(rol);
        },
        error: (error: any) => {
          console.error('Error al crear rol:', error);
          this.notificationService.error('Error al crear el rol');
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  get tituloModal(): string {
    return this.editando ? 'Editar Rol' : 'Crear Nuevo Rol';
  }
}
