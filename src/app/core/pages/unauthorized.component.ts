import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [SharedModule],
  template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-card-content>
          <div class="error-icon">
            <mat-icon>lock</mat-icon>
          </div>

          <h2>Acceso Denegado</h2>
          <p>No tienes permiso para acceder a esta página.</p>
          <p class="error-code">Error 403 - Forbidden</p>

          <div class="actions">
            <button mat-raised-button color="primary" (click)="volverAtras()">
              <mat-icon>arrow_back</mat-icon>
              Volver Atrás
            </button>
            <button mat-raised-button (click)="irAlDashboard()">
              <mat-icon>home</mat-icon>
              Ir al Dashboard
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .unauthorized-card {
      max-width: 500px;
      width: 100%;
      text-align: center;
    }

    mat-card-content {
      padding: 40px 30px;
    }

    .error-icon {
      margin-bottom: 20px;
    }

    .error-icon mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #ff6b6b;
    }

    h2 {
      color: #333;
      margin-bottom: 10px;
      font-size: 24px;
    }

    p {
      color: #666;
      margin: 10px 0;
      font-size: 16px;
    }

    .error-code {
      color: #999;
      font-size: 14px;
      font-family: monospace;
      margin-top: 20px;
    }

    .actions {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 30px;
      flex-wrap: wrap;
    }

    button {
      min-width: 140px;
    }
  `]
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  volverAtras() {
    this.router.navigate(['/dashboard']);
  }

  irAlDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
