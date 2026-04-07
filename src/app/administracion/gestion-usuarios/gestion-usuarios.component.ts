import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SharedModule } from '../../shared/shared.module';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificationService } from '../../core/services/notification.service';
import { DialogoService } from '../../shared/services/dialogo.service';
import { Usuario } from '../../shared/models/models';
import { UsuariosModalComponent } from './usuarios-modal/usuarios-modal.component';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.scss'
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  displayedColumns: string[] = ['id', 'username', 'email', 'rol', 'activo', 'acciones'];

  constructor(
    private usuarioService: UsuarioService,
    private notificationService: NotificationService,
    private dialogoService: DialogoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerTodos().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
        this.notificationService.success('Usuarios cargados correctamente');
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.notificationService.error('Error al cargar los usuarios');
      }
    });
  }

  abrirModalUsuario(usuario?: Usuario): void {
    const dialogRef = this.dialog.open(UsuariosModalComponent, {
      width: '600px',
      disableClose: true,
      data: { usuario }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Si se guardó un usuario, recargar la tabla
        this.cargarUsuarios();
      }
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    this.dialogoService.confirmarEliminacion(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar el usuario "${usuario.username}"?`
    ).subscribe(confirmado => {
      if (confirmado) {
        this.usuarioService.eliminar(usuario.id).subscribe({
          next: () => {
            this.notificationService.success('Usuario eliminado correctamente');
            this.cargarUsuarios();
          },
          error: (error: any) => {
            console.error('Error al eliminar usuario:', error);
            this.notificationService.error('Error al eliminar el usuario');
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
