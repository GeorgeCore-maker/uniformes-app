import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { ProduccionService } from './produccion.service';
import { ProductoService } from '../productos/producto.service';
import { ClienteService } from '../clientes/cliente.service';
import { EventosService } from '../shared/services/eventos.service';
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
export class ProduccionComponent implements OnInit, OnDestroy {
  items: ItemProduccion[] = [];
  itemsFiltrados: ItemProduccion[] = [];
  productos: Producto[] = [];
  clientes: Cliente[] = [];

  displayedColumns: string[] = ['pedidoNumero', 'producto', 'cantidad', 'estado', 'fechaInicio', 'acciones'];
  filtroEstado = 'TODOS';
  estadosDisponibles = ['TODOS', 'PENDIENTE', 'EN_CONFECCION'];

  // Subscripción para eventos de sincronización
  private eventosSubscription?: Subscription;

  constructor(
    private produccionService: ProduccionService,
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private eventosService: EventosService
  ) {}

  ngOnInit() {
    this.cargarDatos();
    this.suscribirseAEventos();
  }

  ngOnDestroy() {
    if (this.eventosSubscription) {
      this.eventosSubscription.unsubscribe();
    }
  }

  private suscribirseAEventos() {
    // Escuchar actualizaciones de pedidos
    this.eventosSubscription = this.eventosService.pedidoActualizado$.subscribe(() => {
      console.log('Pedido actualizado, recargando items de producción...');
      this.cargarItemsProduccion();
    });

    // También recargar cuando cambien los productos (para requiereConfeccion)
    // Esto se activará cuando se actualice un producto desde inventario
    this.eventosSubscription.add(
      this.productoService.obtenerTodos().subscribe(() => {
        console.log('Productos actualizados, recargando datos de producción...');
        this.cargarDatos(); // Recargar tanto productos como items
      })
    );
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
    this.produccionService.obtenerTodos().subscribe({
      next: (items) => {
        console.log('Items recibidos de producción:', items); // Debug

        // Filtrar items que deben aparecer en producción
        this.items = items.filter(item => {
          // 1. El item debe estar habilitado
          if (!item.habilitado) {
            return false;
          }

          // 2. El producto debe requerir confección
          if (!item.producto?.requiereConfeccion) {
            return false;
          }

          // 3. El estado del detalle debe ser PENDIENTE o EN_CONFECCION
          const estadoDetalle = item.detalle?.estado as string;

          const esEstadoValido = estadoDetalle === EstadoPedido.PENDIENTE ||
                 estadoDetalle === EstadoPedido.EN_CONFECCION ||
                 estadoDetalle === 'PENDIENTE' ||
                 estadoDetalle === 'EN_CONFECCION';

          return esEstadoValido;
        });

        console.log('Items filtrados:', this.items); // Debug
        this.actualizarFiltro();
      },
      error: (error) => {
        console.error('Error cargando items de producción:', error);
        this.items = [];
        this.actualizarFiltro();
      }
    });
  }

  actualizarFiltro() {
    if (this.filtroEstado === 'TODOS') {
      this.itemsFiltrados = [...this.items];
    } else {
      this.itemsFiltrados = this.items.filter(item => this.obtenerEstadoItem(item) === this.filtroEstado);
    }
  }

  // Función helper para obtener el estado desde el detalle asociado
  obtenerEstadoItem(item: ItemProduccion): EstadoPedido {
    // Ahora el estado se obtiene directamente del detalle asociado
    return item.detalle?.estado || EstadoPedido.PENDIENTE;
  }

  cambiarEstado(item: ItemProduccion) {
    if (!item.id) return;

    const estadoActual = this.obtenerEstadoItem(item);
    const nuevoEstado = estadoActual === EstadoPedido.PENDIENTE
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
