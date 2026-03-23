import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ClienteService } from '../clientes/cliente.service';
import { ProductoService } from '../productos/producto.service';
import { PedidoService } from '../pedidos/pedido.service';
import { EstadoPedido } from '../shared/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
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
  cargandoDatos = true;

  constructor(
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.cargandoDatos = true;

    // Cargar todos los datos en paralelo
    forkJoin({
      clientes: this.clienteService.obtenerTodos(),
      productos: this.productoService.obtenerTodos(),
      pedidos: this.pedidoService.obtenerTodos()
    }).subscribe({
      next: (datos) => {
        // Contar totales (solo habilitados)
        this.totalClientes = datos.clientes.filter(cliente => cliente.habilitado).length;
        this.totalProductos = datos.productos.filter(producto => producto.habilitado).length;
        this.totalPedidos = datos.pedidos.filter(pedido => pedido.habilitado).length;

        // Calcular pedidos pendientes (que tienen al menos un detalle PENDIENTE o EN_CONFECCION)
        this.pedidosPendientes = datos.pedidos.filter(pedido => {
          if (!pedido.habilitado || !pedido.detalles) return false;

          return pedido.detalles.some(detalle =>
            detalle.estado === EstadoPedido.PENDIENTE ||
            detalle.estado === EstadoPedido.EN_CONFECCION
          );
        }).length;

        this.cargandoDatos = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.cargandoDatos = false;
        // Mantener valores por defecto en caso de error
      }
    });
  }

  recargarEstadisticas() {
    this.cargarEstadisticas();
  }
}
