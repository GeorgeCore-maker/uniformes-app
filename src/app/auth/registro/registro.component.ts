import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UserRole } from '../../shared/models/models';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent {
  username = '';
  password = '';
  role: UserRole = UserRole.VENDEDOR;
  loading = false;
  roles = Object.values(UserRole);

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.loading = true;
    this.authService.register(this.username, this.password, this.role).subscribe({
      next: (success: boolean) => {
        this.loading = false;
        if (success) {
          alert('Registro exitoso');
          this.router.navigate(['/auth/login']);
        } else {
          alert('Error en el registro');
        }
      },
      error: (error: any) => {
        this.loading = false;
        alert('Error al registrar');
      }
    });
  }
}
