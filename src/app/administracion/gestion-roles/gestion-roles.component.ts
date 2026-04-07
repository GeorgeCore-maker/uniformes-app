import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { RolService } from '../../core/services/rol.service';
import { NotificationService } from '../../core/services/notification.service';
import { DialogoService } from '../../shared/services/dialogo.service';
import { Rol } from '../../shared/models/models';
import { RolesModalComponent } from './roles-modal/roles-modal.component';

@Component({
  selector: 'app-gestion-roles',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './gestion-roles.component.html',
  styleUrl: './gestion-roles.component.scss'
})
export class GestionRolesComponent implements OnInit {
  roles: Rol[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'permisosCount', 'activo', 'acciones'];

  constructor(
    private rolService: RolService,
    private notificationService: NotificationService,
    private dialogoService: DialogoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.rolService.obtenerTodos().subscribe({
      next: (roles: Rol[]) => {
        this.roles = roles;
        // console.log('Roles cargados:', this.roles);
        this.notificationService.success('Roles cargados correctamente');
      },
      error: (error: any) => {
        console.error('Error al cargar roles:', error);
        this.notificationService.error('Error al cargar los roles');
      }
    });
  }

  abrirModalRol(rol?: Rol): void {
    const dialogRef = this.dialog.open(RolesModalComponent, {
      width: '700px',
      disableClose: true,
      data: { rol }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si se guardó un rol, recargar la tabla
        this.cargarRoles();
      }
    });
  }

  eliminarRol(rol: Rol): void {
    this.dialogoService.confirmarEliminacion(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar el rol "${rol.nombre}"?`
    ).subscribe(confirmado => {
      if (confirmado) {
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
    });
  }

  obtenerColorChipEstado(activo: boolean): string {
    return activo ? 'primary' : 'warn';
  }

  obtenerTextoEstado(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }
}
