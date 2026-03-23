import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ProduccionService } from './produccion.service';
import { ProductoService } from '../productos/producto.service';
import { ClienteService } from '../clientes/cliente.service';
import { ItemProduccion, EstadoPedido, Producto, Cliente } from '../shared/models/models';

@Component({
  selector: 'app-produccion',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './produccion.component.html',
  styleUrl: './produccion.component.scss'
})
export class ProduccionComponent implements OnInit {
  items: ItemProduccion[] = [];
  itemsFiltrados: ItemProduccion[] = [];
  productos: Producto[] = [];
  clientes: Cliente[] = [];

  displayedColumns: string[] = ['pedidoNumero', 'producto', 'cantidad', 'estado', 'fechaInicio', 'acciones'];
  filtroEstado = 'TODOS';
  estadosDisponibles = ['TODOS', 'PENDIENTE', 'EN_CONFECCION'];

  constructor(
    private produccionService: ProduccionService,
    private productoService: ProductoService,
    private clienteService: ClienteService
  ) {}

  ngOnInit() {
    this.cargarDatos();
  }

  private cargarDatos() {
    // Cargar productos y clientes para mostrar nombres en lugar de IDs
    this.productoService.obtenerTodos().subscribe(productos => {
      this.productos = productos;
      this.cargarItemsProduccion();
    });

    this.clienteService.obtenerTodos().subscribe(clientes => {
      this.clientes = clientes;
    });
  }

  private cargarItemsProduccion() {
    this.produccionService.obtenerTodos().subscribe(items => {
      // Filtrar solo los items que están PENDIENTE o EN_CONFECCION
      this.items = items.filter(item =>
        item.estado === EstadoPedido.PENDIENTE ||
        item.estado === EstadoPedido.EN_CONFECCION
      );
      this.actualizarFiltro();
    });
  }

  recargarDatos() {
    this.cargarItemsProduccion();
  }

  actualizarFiltro() {
    if (this.filtroEstado === 'TODOS') {
      this.itemsFiltrados = [...this.items];
    } else {
      this.itemsFiltrados = this.items.filter(item => item.estado === this.filtroEstado);
    }
  }

  cambiarEstado(item: ItemProduccion) {
    if (!item.id) return;

    const nuevoEstado = item.estado === EstadoPedido.PENDIENTE
      ? EstadoPedido.EN_CONFECCION
      : EstadoPedido.TERMINADO;

    this.produccionService.cambiarEstado(item.id, nuevoEstado).subscribe({
      next: (itemActualizado) => {
        // Recargar todos los datos para asegurar consistencia
        this.cargarItemsProduccion();

        // Mostrar mensaje de éxito
        console.log(`Estado actualizado a ${nuevoEstado} para el item de ${this.getProductoNombre(item.productoId)}`);
      },
      error: (error) => {
        console.error('Error al cambiar estado:', error);
        // Recargar datos en caso de error para asegurar consistencia
        this.cargarItemsProduccion();
      }
    });
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case EstadoPedido.PENDIENTE:
        return 'accent';
      case EstadoPedido.EN_CONFECCION:
        return 'warn';
      case EstadoPedido.TERMINADO:
        return 'primary';
      default:
        return 'basic';
    }
  }

  getProductoNombre(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? `${producto.nombre} - ${producto.talla}` : 'Producto no encontrado';
  }

  formatearFecha(fecha?: Date | string): string {
    if (!fecha) return 'No definida';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-ES');
  }
}
