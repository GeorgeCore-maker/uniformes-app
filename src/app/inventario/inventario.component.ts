import { Component, OnInit } from '@angular/core';
import { InventarioService, ProductoInventario } from '../shared/services/inventario.service';
import { NotificationService } from '../core/services/notification.service';
import { DialogoService } from '../shared/services/dialogo.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  productos: ProductoInventario[] = [];
  productosFiltrados: ProductoInventario[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'stock', 'stockMinimo', 'estado', 'requiereConfeccion', 'acciones'];
  filtro = '';
  isLoading = true;

  constructor(
    private inventarioService: InventarioService,
    private notificationService: NotificationService,
    private dialogoService: DialogoService
  ) {}

  ngOnInit() {
    this.cargarInventario();
  }

  cargarInventario() {
    this.isLoading = true;
    this.inventarioService.obtenerInventario().subscribe({
      next: (productos) => {
        this.productos = productos;
        this.actualizarFiltro();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar inventario:', error);
        this.notificationService.error('Error al cargar el inventario');
        this.isLoading = false;
      }
    });
  }

  actualizarFiltro() {
    if (this.filtro.trim()) {
      this.productosFiltrados = this.productos.filter(p =>
        p.nombre.toLowerCase().includes(this.filtro.toLowerCase())
      );
    } else {
      this.productosFiltrados = [...this.productos];
    }
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'NORMAL':
        return 'primary';
      case 'BAJO':
        return 'warn';
      case 'CRÍTICO':
        return 'error';
      default:
        return 'primary';
    }
  }

  reordenar(producto: ProductoInventario) {
    // Por ahora solo mostrar una notificación
    this.notificationService.success(`Función de reorden para "${producto.nombre}" - Próximamente disponible`);
  }

  actualizarStock(producto: ProductoInventario, nuevoStock: number) {
    if (nuevoStock < 0) {
      this.notificationService.error('El stock no puede ser negativo');
      return;
    }

    this.inventarioService.actualizarStock(producto.id, nuevoStock).subscribe({
      next: () => {
        this.notificationService.success('Stock actualizado correctamente');
        this.cargarInventario(); // Recargar para obtener el estado actualizado
      },
      error: (error) => {
        console.error('Error al actualizar stock:', error);
        this.notificationService.error('Error al actualizar el stock');
      }
    });
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'NORMAL':
        return 'check_circle';
      case 'BAJO':
        return 'warning';
      case 'CRÍTICO':
        return 'error';
      default:
        return 'help';
    }
  }

  // Métodos para el resumen de inventario
  getProductosNormal(): number {
    return this.productosFiltrados.filter(p => p.estado === 'NORMAL').length;
  }

  getProductosBajo(): number {
    return this.productosFiltrados.filter(p => p.estado === 'BAJO').length;
  }

  getProductosCritico(): number {
    return this.productosFiltrados.filter(p => p.estado === 'CRÍTICO').length;
  }

  cambiarRequiereConfeccion(producto: ProductoInventario, nuevoEstado: boolean): void {
    const accion = nuevoEstado ? 'requerir confección' : 'no requerir confección';
    const mensaje = `¿Está seguro de que desea cambiar "${producto.nombre}" para ${accion}?`;

    this.dialogoService.confirmarAccion(
      'Cambiar Estado de Confección',
      mensaje,
      'Confirmar'
    ).subscribe((confirmado) => {
      if (confirmado) {
        this.actualizarRequiereConfeccion(producto, nuevoEstado);
      } else {
        // Revertir el checkbox si se cancela
        producto.requiereConfeccion = !nuevoEstado;
      }
    });
  }

  private actualizarRequiereConfeccion(producto: ProductoInventario, requiereConfeccion: boolean): void {
    this.inventarioService.actualizarRequiereConfeccion(producto.id, requiereConfeccion).subscribe({
      next: () => {
        producto.requiereConfeccion = requiereConfeccion;

        const mensaje = requiereConfeccion ?
          `"${producto.nombre}" ahora requiere confección` :
          `"${producto.nombre}" ya no requiere confección`;

        this.notificationService.success(mensaje);

        // Recargar inventario para asegurar consistencia
        this.cargarInventario();
      },
      error: (error) => {
        console.error('Error al actualizar requiere confección:', error);
        this.notificationService.error('Error al actualizar el estado de confección');

        // Revertir el cambio local si falla el backend
        producto.requiereConfeccion = !requiereConfeccion;
      }
    });
  }
}
