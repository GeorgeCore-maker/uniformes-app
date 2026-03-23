import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PedidoService } from '../pedido.service';
import { Pedido, EstadoPedido } from '../../shared/models/models';
import { FormularioPedidoComponent } from '../formulario-pedido/formulario-pedido.component';
import { DialogoService } from '../../shared';
import { ExportService } from '../../core/services/export.service';
import { NotificationService } from '../../core/services/notification.service';
import { VentasFilterService, RangoFechas } from '../../core/services/ventas-filter.service';
import { ProduccionService } from '../../produccion/produccion.service';

@Component({
  selector: 'app-lista-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './lista-pedidos.component.html',
  styleUrl: './lista-pedidos.component.scss'
})
export class ListaPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  displayedColumns: string[] = ['id', 'numero', 'clienteId', 'subtotal', 'total', 'acciones'];
  pageSizeOptions: number[] = [5, 10, 25];
  pageSize = 5;
  currentPage = 0;
  totalItems = 0;

  filtroNumero = '';
  filtroEstado = '';
  estados = Object.values(EstadoPedido);

  // Filtro de fechas
  formularioFechas: FormGroup;
  rangoFechasActual: RangoFechas;

  constructor(
    private pedidoService: PedidoService,
    private dialog: MatDialog,
    private exportService: ExportService,
    private notificationService: NotificationService,
    private ventasFilterService: VentasFilterService,
    private produccionService: ProduccionService,
    private fb: FormBuilder,
    private dialogoService: DialogoService
  ) {
    this.rangoFechasActual = this.ventasFilterService.obtenerRangoFechasActual();
    this.formularioFechas = this.fb.group({
      fechaInicio: [this.rangoFechasActual.fechaInicio],
      fechaFin: [this.rangoFechasActual.fechaFin]
    });
  }

  ngOnInit() {
    this.cargarPedidos();
    this.suscribirseARangoFechas();
  }

  suscribirseARangoFechas() {
    this.ventasFilterService.rangoFechas$.subscribe((rango) => {
      this.rangoFechasActual = rango;
      this.aplicarFiltros();
    });
  }

  cargarPedidos() {
    this.pedidoService.obtenerTodos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;

        // Asegurarse de que el filtro de fechas incluya hoy
        const hoy = new Date();
        const rangoActual = this.rangoFechasActual;

        // Si la fecha fin es anterior a hoy, actualizarla a hoy
        if (rangoActual.fechaFin < hoy) {
          const nuevoRango = {
            fechaInicio: rangoActual.fechaInicio,
            fechaFin: hoy
          };
          this.ventasFilterService.actualizarRangoFechas(nuevoRango);
        }

        this.aplicarFiltros();
        this.notificationService.success('Pedidos cargados correctamente');
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.notificationService.error('Error al cargar los pedidos');
      }
    });
  }

  aplicarFiltros() {
    this.pedidosFiltrados = this.pedidos.filter((pedido) => {
      const coincideNumero = pedido.numero.toString().includes(this.filtroNumero);
      const coincideEstado = !this.filtroEstado || pedido.estado === this.filtroEstado;
      return coincideNumero && coincideEstado;
    });

    // Aplicar filtro de fechas
    this.pedidosFiltrados = this.ventasFilterService.filtrarPorRangoFechas(
      this.pedidosFiltrados,
      this.rangoFechasActual
    );

    this.totalItems = this.pedidosFiltrados.length;
    this.currentPage = 0;
  }

  get pedidosPaginados(): Pedido[] {
    const inicio = this.currentPage * this.pageSize;
    const fin = inicio + this.pageSize;
    return this.pedidosFiltrados.slice(inicio, fin);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  buscar() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtroNumero = '';
    this.filtroEstado = '';
    this.establecerUltimos30Dias();
    this.aplicarFiltros();
  }

  // Métodos para filtro de fechas
  actualizarRangoFechas() {
    const valores = this.formularioFechas.value;
    if (valores.fechaInicio && valores.fechaFin) {
      try {
        this.ventasFilterService.actualizarRangoFechas({
          fechaInicio: new Date(valores.fechaInicio),
          fechaFin: new Date(valores.fechaFin)
        });
        this.notificationService.success('Rango de fechas actualizado');
      } catch (error) {
        this.notificationService.error('Error al actualizar el rango de fechas');
      }
    }
  }

  establecerUltimos7Dias() {
    this.ventasFilterService.establecerUltimos7Dias();
    this.actualizarFormularioFechas();
  }

  establecerUltimos30Dias() {
    this.ventasFilterService.establecerUltimos30Dias();
    this.actualizarFormularioFechas();
  }

  establecerMesActual() {
    this.ventasFilterService.establecerMesActual();
    this.actualizarFormularioFechas();
  }

  establecerAnoActual() {
    this.ventasFilterService.establecerAñoActual();
    this.actualizarFormularioFechas();
  }

  private actualizarFormularioFechas() {
    const rango = this.ventasFilterService.obtenerRangoFechasActual();
    this.formularioFechas.patchValue({
      fechaInicio: rango.fechaInicio,
      fechaFin: rango.fechaFin
    });
  }

  // Métodos de exportación
  exportarPedidoAPdf(pedido: Pedido) {
    try {
      this.exportService.exportarPedidoAPdf(pedido);
      this.notificationService.success(`Pedido ${pedido.numero} exportado a PDF`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.notificationService.error('Error al exportar el pedido a PDF');
    }
  }

  exportarSeleccionadosAExcel() {
    if (this.pedidosFiltrados.length === 0) {
      this.notificationService.warning('No hay pedidos para exportar');
      return;
    }

    try {
      this.exportService.exportarPedidosAExcel(this.pedidosFiltrados, 'pedidos_filtrados');
      this.notificationService.success(`${this.pedidosFiltrados.length} pedidos exportados a Excel`);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      this.notificationService.error('Error al exportar los pedidos a Excel');
    }
  }

  exportarTodosAExcel() {
    if (this.pedidos.length === 0) {
      this.notificationService.warning('No hay pedidos para exportar');
      return;
    }

    try {
      this.exportService.exportarPedidosAExcel(this.pedidos, 'todos_pedidos');
      this.notificationService.success(`${this.pedidos.length} pedidos exportados a Excel`);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      this.notificationService.error('Error al exportar todos los pedidos a Excel');
    }
  }

  abrirFormulario(pedido?: Pedido) {
    const dialogRef = this.dialog.open(FormularioPedidoComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'formulario-pedido-dialog',
      data: pedido || {}
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        if (pedido?.id) {
          // Para edición, el resultado ya incluye las propiedades originales del pedido
          this.pedidoService.actualizar(pedido.id, resultado).subscribe({
            next: () => {
              this.notificationService.success('Pedido actualizado correctamente');
              this.cargarPedidos();
            },
            error: (error) => {
              console.error('Error al actualizar:', error);
              this.notificationService.error('Error al actualizar el pedido');
            }
          });
        } else {
          this.pedidoService.crear(resultado).subscribe({
            next: (pedidoCreado) => {
              this.notificationService.success('Pedido creado correctamente');

              // Crear items de producción si es necesario
              if (resultado.crearItemsProduccion && pedidoCreado.detalles) {
                this.crearItemsProduccion(pedidoCreado);
              }

              this.cargarPedidos();
            },
            error: (error) => {
              console.error('Error al crear:', error);
              this.notificationService.error('Error al crear el pedido');
            }
          });
        }
      }
    });
  }

  private crearItemsProduccion(pedido: Pedido): void {
    // Filtrar detalles que necesitan producción (PENDIENTE o EN_CONFECCION)
    const detallesParaProduccion = pedido.detalles?.filter(detalle =>
      detalle.estado === EstadoPedido.PENDIENTE || detalle.estado === EstadoPedido.EN_CONFECCION
    ) || [];

    if (detallesParaProduccion.length > 0) {
      this.produccionService.crearItemsDesdeDetallePedido(
        pedido.id,
        pedido.numero,
        detallesParaProduccion
      ).subscribe({
        next: (itemsCreados) => {
          if (itemsCreados.length > 0) {
            this.notificationService.success(
              `${itemsCreados.length} item(s) agregado(s) a producción automáticamente`
            );
          }
        },
        error: (error) => {
          console.error('Error al crear items de producción:', error);
          this.notificationService.error('Error al crear items de producción');
        }
      });
    }
  }

  cambiarEstado(pedido: Pedido, nuevoEstado: EstadoPedido) {
    this.dialogoService.confirmarAccion(
      'Cambiar estado',
      `¿Cambiar pedido a ${nuevoEstado}?`,
      'Cambiar'
    ).subscribe((confirmado) => {
      if (confirmado) {
        this.pedidoService.cambiarEstado(pedido.id, nuevoEstado).subscribe({
          next: () => {
            this.notificationService.success('Estado del pedido actualizado');
            this.cargarPedidos();
          },
          error: (error) => {
            console.error('Error al cambiar estado:', error);
            this.notificationService.error('Error al cambiar el estado del pedido');
          }
        });
      }
    });
  }

  eliminar(pedido: Pedido) {
    this.dialogoService.confirmarEliminacion(
      'Eliminar pedido',
      `¿Está seguro de eliminar el pedido ${pedido.numero}?`
    ).subscribe((confirmado) => {
      if (confirmado) {
        this.pedidoService.eliminar(pedido.id).subscribe({
          next: () => {
            this.notificationService.success('Pedido eliminado correctamente');
            this.cargarPedidos();
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            this.notificationService.error('Error al eliminar el pedido');
          }
        });
      }
    });
  }

  getColorEstado(estado: EstadoPedido): string {
    const colores: { [key in EstadoPedido]: string } = {
      [EstadoPedido.PENDIENTE]: 'warn',
      [EstadoPedido.EN_CONFECCION]: 'accent',
      [EstadoPedido.TERMINADO]: 'primary',
      [EstadoPedido.ENVIADO]: 'info',
      [EstadoPedido.ENTREGADO]: 'success',
      [EstadoPedido.CANCELADO]: 'default'
    };
    return colores[estado] || 'primary';
  }
}
