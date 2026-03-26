import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { Usuario, Rol } from '../../../shared/models/models';
import { UsuarioService } from '../../../core/services/usuario.service';
import { RolService } from '../../../core/services/rol.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-usuarios-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './usuarios-modal.component.html',
  styleUrls: ['./usuarios-modal.component.scss']
})
export class UsuariosModalComponent implements OnInit {
  formularioUsuario: FormGroup;
  roles: Rol[] = [];
  editando = false;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<UsuariosModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usuario?: Usuario }
  ) {
    this.editando = !!data?.usuario;
    this.formularioUsuario = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.email]],
      password: ['', this.editando ? [] : [Validators.required, Validators.minLength(6)]],
      role: ['VENDEDOR', Validators.required],
      activo: [true]
    });
  }

  ngOnInit() {
    this.cargarRoles();
    if (this.data?.usuario) {
      this.cargarDatosUsuario();
    }
  }

  cargarRoles(): void {
    this.rolService.obtenerTodos().subscribe({
      next: (roles: Rol[]) => {
        this.roles = roles;
      },
      error: (error: any) => {
        console.error('Error al cargar roles:', error);
        this.notificationService.error('Error al cargar roles');
      }
    });
  }

  cargarDatosUsuario(): void {
    if (this.data.usuario) {
      this.formularioUsuario.patchValue({
        username: this.data.usuario.username,
        email: this.data.usuario.email,
        role: this.data.usuario.role,
        activo: this.data.usuario.activo,
        password: '' // Campo vacío para nueva contraseña opcional
      });
    }
  }

  guardarUsuario(): void {
    if (this.formularioUsuario.invalid) {
      this.notificationService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    const formValue = this.formularioUsuario.value;

    const datosUsuario: any = {
      username: formValue.username,
      email: formValue.email,
      role: formValue.role,
      activo: formValue.activo,
      habilitado: true,
      updatedAt: new Date()
    };

    // Solo incluir contraseña si se proporcionó
    if (!this.editando || (this.editando && formValue.password && formValue.password.trim() !== '')) {
      datosUsuario.password = formValue.password;
    }

    if (this.editando && this.data.usuario) {
      // Actualizar usuario existente
      this.usuarioService.actualizar(this.data.usuario.id, datosUsuario).subscribe({
        next: (usuario) => {
          const mensaje = datosUsuario.password ?
            'Usuario y contraseña actualizados correctamente' :
            'Usuario actualizado correctamente';
          this.notificationService.success(mensaje);
          this.dialogRef.close(usuario);
        },
        error: (error: any) => {
          console.error('Error al actualizar usuario:', error);
          this.notificationService.error('Error al actualizar el usuario');
        }
      });
    } else {
      // Crear nuevo usuario
      datosUsuario.id = Date.now();
      datosUsuario.token = 'fake-jwt-token-' + Date.now();
      datosUsuario.createdAt = new Date();

      this.usuarioService.crear(datosUsuario).subscribe({
        next: (usuario) => {
          this.notificationService.success('Usuario creado correctamente');
          this.dialogRef.close(usuario);
        },
        error: (error: any) => {
          console.error('Error al crear usuario:', error);
          this.notificationService.error('Error al crear el usuario');
        }
      });
    }
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  get tituloModal(): string {
    return this.editando ? 'Editar Usuario' : 'Crear Nuevo Usuario';
  }
}
