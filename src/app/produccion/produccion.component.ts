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

interface PedidoProduccion {
  id: number;
  numero: string;
  cliente: string;
  cantidad: number;
  estado: string;
  fechaInicio?: string;
}

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
  pedidos: PedidoProduccion[] = [];
  pedidosFiltrados: PedidoProduccion[] = [];
  displayedColumns: string[] = ['id', 'numero', 'cliente', 'cantidad', 'estado', 'acciones'];
  filtroEstado = 'EN_CONFECCION';
  estadosDisponibles = ['EN_CONFECCION', 'TERMINADO'];

  constructor() {}

  ngOnInit() {
    this.cargarPedidos();
  }

  cargarPedidos() {
    // Datos de ejemplo
    this.pedidos = [
      { id: 1, numero: 'PED-001', cliente: 'Colegio San José', cantidad: 50, estado: 'EN_CONFECCION', fechaInicio: '2026-02-20' },
      { id: 2, numero: 'PED-002', cliente: 'Hospital Central', cantidad: 30, estado: 'EN_CONFECCION', fechaInicio: '2026-02-19' },
      { id: 3, numero: 'PED-003', cliente: 'Empresa ABC', cantidad: 25, estado: 'TERMINADO', fechaInicio: '2026-02-15' },
      { id: 4, numero: 'PED-004', cliente: 'Colegio María Auxiliadora', cantidad: 40, estado: 'EN_CONFECCION', fechaInicio: '2026-02-18' }
    ];
    this.actualizarFiltro();
  }

  actualizarFiltro() {
    this.pedidosFiltrados = this.pedidos.filter(p => p.estado === this.filtroEstado);
  }

  cambiarEstado(pedido: PedidoProduccion) {
    const nuevoEstado = pedido.estado === 'EN_CONFECCION' ? 'TERMINADO' : 'EN_CONFECCION';
    const index = this.pedidos.findIndex(p => p.id === pedido.id);
    if (index !== -1) {
      this.pedidos[index].estado = nuevoEstado;
      this.actualizarFiltro();
    }
  }

  getEstadoColor(estado: string): string {
    return estado === 'EN_CONFECCION' ? 'warn' : 'primary';
  }
}
