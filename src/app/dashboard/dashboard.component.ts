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
        console.log('Datos recibidos:', datos); // Debug log

        // Contar totales - ser más permisivo con el filtrado
        this.totalClientes = datos.clientes.filter(cliente => {
          // Mostrar clientes que no estén explícitamente deshabilitados
          return cliente.habilitado !== false;
        }).length;

        this.totalProductos = datos.productos.filter(producto => {
          // Mostrar productos que no estén explícitamente deshabilitados
          return (producto as any).habilitado !== false && (producto as any).activo !== false;
        }).length;

        this.totalPedidos = datos.pedidos.filter(pedido => {
          // Mostrar pedidos que no estén explícitamente deshabilitados
          return (pedido as any).habilitado !== false;
        }).length;

        // Calcular pedidos pendientes
        this.pedidosPendientes = datos.pedidos.filter(pedido => {
          // Verificar que el pedido esté habilitado
          if ((pedido as any).habilitado === false) return false;

          // Verificar el estado del pedido
          const estado = (pedido as any).estado;
          if (estado === 'PENDIENTE' || estado === 'EN_CONFECCION') {
            return true;
          }

          // Si tiene detalles, verificar si alguno está pendiente o en confección
          if (pedido.detalles && pedido.detalles.length > 0) {
            return pedido.detalles.some(detalle => {
              const estadoDetalle = (detalle as any).estado;
              return estadoDetalle === 'PENDIENTE' || estadoDetalle === 'EN_CONFECCION';
            });
          }

          return false;
        }).length;

        console.log('Estadísticas calculadas:', {
          clientes: this.totalClientes,
          productos: this.totalProductos,
          pedidos: this.totalPedidos,
          pendientes: this.pedidosPendientes
        });

        // Log detallado de clientes para debug
        console.log('Detalle de clientes:', datos.clientes.map(c => ({
          id: c.id,
          nombre: c.nombre,
          habilitado: c.habilitado,
          incluido: c.habilitado !== false
        })));

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
