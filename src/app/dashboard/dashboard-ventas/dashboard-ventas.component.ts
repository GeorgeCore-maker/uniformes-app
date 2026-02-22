import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PedidoService } from '../../pedidos/pedido.service';
import { VentasFilterService, RangoFechas, EstadisticasVentas } from '../../core/services/ventas-filter.service';
import { Pedido } from '../../shared/models/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard-ventas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './dashboard-ventas.component.html',
  styleUrl: './dashboard-ventas.component.scss'
})
export class DashboardVentasComponent implements OnInit {
  formularioFechas: FormGroup;
  pedidos: Pedido[] = [];
  estadisticas: EstadisticasVentas | null = null;
  ventasPorDia: { [key: string]: number } = {};
  ventasPorCliente: { clienteId: number; totalVentas: number; cantidad: number }[] = [];
  cargando = false;

  constructor(
    private fb: FormBuilder,
    private pedidoService: PedidoService,
    private ventasFilterService: VentasFilterService,
    private notificationService: NotificationService
  ) {
    const rangoActual = this.ventasFilterService.obtenerRangoFechasActual();
    this.formularioFechas = this.fb.group({
      fechaInicio: [rangoActual.fechaInicio],
      fechaFin: [rangoActual.fechaFin]
    });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.pedidoService.obtenerTodos().subscribe({
      next: (pedidos) => {
        this.pedidos = pedidos;
        this.calcularEstadisticas();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.notificationService.error('Error al cargar los datos de ventas');
        this.cargando = false;
      }
    });
  }

  calcularEstadisticas() {
    const rangoFechas = this.ventasFilterService.obtenerRangoFechasActual();
    this.estadisticas = this.ventasFilterService.obtenerEstadisticasVentas(this.pedidos, rangoFechas);
    this.ventasPorDia = this.ventasFilterService.ventasPorDia(this.pedidos, rangoFechas);
    this.ventasPorCliente = this.ventasFilterService.ventasPorCliente(this.pedidos, rangoFechas);
  }

  actualizarRangoFechas() {
    const valores = this.formularioFechas.value;
    if (valores.fechaInicio && valores.fechaFin) {
      try {
        this.ventasFilterService.actualizarRangoFechas({
          fechaInicio: new Date(valores.fechaInicio),
          fechaFin: new Date(valores.fechaFin)
        });
        this.calcularEstadisticas();
        this.notificationService.success('Rango de fechas actualizado');
      } catch (error) {
        this.notificationService.error('Error al actualizar el rango de fechas');
      }
    }
  }

  establecerUltimos7Dias() {
    this.ventasFilterService.establecerUltimos7Dias();
    this.actualizarFormulario();
  }

  establecerUltimos30Dias() {
    this.ventasFilterService.establecerUltimos30Dias();
    this.actualizarFormulario();
  }

  establecerMesActual() {
    this.ventasFilterService.establecerMesActual();
    this.actualizarFormulario();
  }

  establecerAnoActual() {
    this.ventasFilterService.establecerAñoActual();
    this.actualizarFormulario();
  }

  private actualizarFormulario() {
    const rango = this.ventasFilterService.obtenerRangoFechasActual();
    this.formularioFechas.patchValue({
      fechaInicio: rango.fechaInicio,
      fechaFin: rango.fechaFin
    });
    this.calcularEstadisticas();
  }

  obtenerDiasConVentas(): string[] {
    return Object.keys(this.ventasPorDia).sort();
  }

  obtenerTop5Clientes() {
    return this.ventasPorCliente
      .sort((a, b) => b.totalVentas - a.totalVentas)
      .slice(0, 5);
  }

  formatearMoneda(valor: number): string {
    return this.ventasFilterService.formatearMoneda(valor);
  }
}
