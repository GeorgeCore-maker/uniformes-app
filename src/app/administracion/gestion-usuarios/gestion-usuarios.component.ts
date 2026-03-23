import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { UsuarioService } from '../../core/services/usuario.service';
import { RolService } from '../../core/services/rol.service';
import { NotificationService } from '../../core/services/notification.service';
import { DialogoService } from '../../shared';
import { Usuario, Rol } from '../../shared/models/models';

@Component({
  selector: 'app-gestion-usuarios',
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
    MatSelectModule,
    MatSlideToggleModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule
  ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.scss'
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosHabilitados: Usuario[] = [];
  roles: Rol[] = [];
  formularioUsuario: FormGroup;
  mostrarFormulario = false;
  editandoUsuario: Usuario | null = null;
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'activo', 'acciones'];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private notificationService: NotificationService,
    private dialogoService: DialogoService
  ) {
    this.formularioUsuario = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: ['VENDEDOR', Validators.required],
      activo: [true]
    });
  }

  ngOnInit() {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios(): void {
    this.usuarioService.obtenerTodos().subscribe({
      next: (usuarios: Usuario[]) => {
        this.usuarios = usuarios;
        // Filtrar solo usuarios habilitados para la tabla
        this.usuariosHabilitados = usuarios.filter(u => u.habilitado !== false);
        this.notificationService.success('Usuarios cargados correctamente');
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
        this.notificationService.error('Error al cargar los usuarios');
      }
    });
  }

  cargarRoles(): void {
    this.rolService.obtenerTodos().subscribe({
      next: (roles: Rol[]) => {
        this.roles = roles;
      },
      error: (error: any) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  abrirFormulario(usuario?: Usuario) {
    this.mostrarFormulario = true;
    if (usuario) {
      this.editandoUsuario = usuario;
      this.formularioUsuario.patchValue({
        username: usuario.username,
        email: usuario.email,
        role: usuario.role,
        activo: usuario.activo
      });
      this.formularioUsuario.get('password')?.clearValidators();
      this.formularioUsuario.get('password')?.updateValueAndValidity();
    } else {
      this.editandoUsuario = null;
      this.formularioUsuario.reset({ activo: true, role: 'VENDEDOR' });
      this.formularioUsuario.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.formularioUsuario.get('password')?.updateValueAndValidity();
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.editandoUsuario = null;
    this.formularioUsuario.reset({ activo: true, role: 'VENDEDOR' });
  }

  guardarUsuario() {
    if (this.formularioUsuario.invalid) {
      this.notificationService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    const datosUsuario = {
      ...this.formularioUsuario.value,
      id: this.editandoUsuario?.id || Date.now(),
      token: this.editandoUsuario?.token || 'fake-jwt-token-' + Date.now(),
      habilitado: this.editandoUsuario?.habilitado !== false, // Preservar el estado habilitado
      createdAt: this.editandoUsuario?.createdAt || new Date(),
      updatedAt: new Date()
    };

    if (this.editandoUsuario) {
      this.usuarioService.actualizar(this.editandoUsuario.id, datosUsuario).subscribe({
        next: () => {
          this.notificationService.success('Usuario actualizado correctamente');
          this.cargarUsuarios();
          this.cerrarFormulario();
        },
        error: (error: any) => {
          console.error('Error al actualizar usuario:', error);
          this.notificationService.error('Error al actualizar el usuario');
        }
      });
    } else {
      this.usuarioService.crear(datosUsuario).subscribe({
        next: () => {
          this.notificationService.success('Usuario creado correctamente');
          this.cargarUsuarios();
          this.cerrarFormulario();
        },
        error: (error: any) => {
          console.error('Error al crear usuario:', error);
          this.notificationService.error('Error al crear el usuario');
        }
      });
    }
  }

  cambiarRol(usuario: Usuario, nuevoRol: string): void {
    this.usuarioService.cambiarRol(usuario.id, nuevoRol).subscribe({
      next: () => {
        this.notificationService.success(`Rol del usuario ${usuario.username} actualizado a ${nuevoRol}`);
        this.cargarUsuarios();
      },
      error: (error: any) => {
        console.error('Error al cambiar rol:', error);
        this.notificationService.error('Error al cambiar el rol del usuario');
      }
    });
  }

  cambiarEstado(usuario: Usuario): void {
    const nuevoEstado = !usuario.activo;
    this.usuarioService.cambiarEstado(usuario.id, nuevoEstado).subscribe({
      next: () => {
        this.notificationService.success(
          `Usuario ${usuario.username} ${nuevoEstado ? 'activado' : 'desactivado'}`
        );
        this.cargarUsuarios();
      },
      error: (error: any) => {
        console.error('Error al cambiar estado:', error);
        this.notificationService.error('Error al cambiar el estado del usuario');
      }
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    this.dialogoService.confirmarEliminacion(
      'Eliminar usuario',
      `¿Está seguro de que desea eliminar el usuario "${usuario.username}"?`
    ).subscribe((confirmado) => {
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

  obtenerNombreRol(role: string | number): string {
    if (typeof role === 'string') {
      return role;
    }
    const rolEncontrado = this.roles.find(r => r.id === role);
    return rolEncontrado ? rolEncontrado.nombre : 'Desconocido';
  }
}
