import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  totalClientes = 0;
  totalProductos = 0;
  totalPedidos = 0;
  pedidosPendientes = 0;

  constructor() {}

  ngOnInit() {
    // Cargar datos desde la API si es necesario
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    // Placeholder - en una aplicación real, se cargarían desde los servicios
    this.totalClientes = 15;
    this.totalProductos = 48;
    this.totalPedidos = 23;
    this.pedidosPendientes = 5;
  }
}
