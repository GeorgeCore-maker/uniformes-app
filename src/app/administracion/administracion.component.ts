import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="administracion-container">
      <h2>Administración del Sistema</h2>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .administracion-container {
      padding: 20px;
    }
    h2 {
      margin-bottom: 20px;
      color: #333;
    }
  `]
})
export class AdministracionComponent {}
