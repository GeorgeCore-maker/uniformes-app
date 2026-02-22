import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.loading = true;
    this.authService.login(this.username, this.password).subscribe({
      next: (success: boolean) => {
        this.loading = false;
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          alert('Credenciales incorrectas');
        }
      },
      error: (error: any) => {
        this.loading = false;
        alert('Error al iniciar sesión');
      }
    });
  }
}
