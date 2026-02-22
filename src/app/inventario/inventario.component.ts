import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

interface ProductoInventario {
  id: number;
  nombre: string;
  stock: number;
  stockMinimo: number;
  estado: string;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    FormsModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss'
})
export class InventarioComponent implements OnInit {
  productos: ProductoInventario[] = [];
  productosFiltrados: ProductoInventario[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'stock', 'stockMinimo', 'estado', 'acciones'];
  filtro = '';

  constructor() {}

  ngOnInit() {
    this.cargarInventario();
  }

  cargarInventario() {
    // Datos de ejemplo
    this.productos = [
      { id: 1, nombre: 'Uniforme Escolar - Talla S', stock: 5, stockMinimo: 10, estado: 'BAJO' },
      { id: 2, nombre: 'Uniforme Escolar - Talla M', stock: 25, stockMinimo: 10, estado: 'NORMAL' },
      { id: 3, nombre: 'Uniforme Escolar - Talla L', stock: 8, stockMinimo: 10, estado: 'BAJO' },
      { id: 4, nombre: 'Traje Médico - Azul', stock: 45, stockMinimo: 20, estado: 'NORMAL' },
      { id: 5, nombre: 'Dotación - Camiseta', stock: 2, stockMinimo: 15, estado: 'CRÍTICO' }
    ];
    this.actualizarFiltro();
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

  reordenar(id: number) {
    console.log('Generar orden de compra para producto:', id);
  }
}
