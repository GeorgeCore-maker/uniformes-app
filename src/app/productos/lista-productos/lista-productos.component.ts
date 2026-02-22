import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSelectModule } from '@angular/material/select';
import { ProductoService } from '../producto.service';
import { Producto, CategoriaProducto } from '../../shared/models/models';
import { FormularioProductoComponent } from '../formulario-producto/formulario-producto.component';
import { DialogoConfirmacionComponent } from '../dialogo-confirmacion/dialogo-confirmacion.component';

@Component({
  selector: 'app-lista-productos',
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
    MatBadgeModule,
    MatSelectModule
  ],
  templateUrl: './lista-productos.component.html',
  styleUrl: './lista-productos.component.scss'
})
export class ListaProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'categoria', 'talla', 'precio', 'costo', 'stock', 'acciones'];
  pageSizeOptions: number[] = [5, 10, 25];
  pageSize = 5;
  currentPage = 0;
  totalItems = 0;

  filtroNombre = '';
  filtroCategoria = '';
  categorias = Object.values(CategoriaProducto);

  constructor(
    private productoService: ProductoService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.obtenerTodos().subscribe((productos) => {
      this.productos = productos;
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter((producto) => {
      const coincideNombre = producto.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const coincideCategoria = !this.filtroCategoria || producto.categoria === this.filtroCategoria;
      return coincideNombre && coincideCategoria;
    });

    this.totalItems = this.productosFiltrados.length;
    this.currentPage = 0;
  }

  get productosPaginados(): Producto[] {
    const inicio = this.currentPage * this.pageSize;
    const fin = inicio + this.pageSize;
    return this.productosFiltrados.slice(inicio, fin);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  buscar() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroCategoria = '';
    this.aplicarFiltros();
  }

  abrirFormulario(producto?: Producto) {
    const dialogRef = this.dialog.open(FormularioProductoComponent, {
      width: '500px',
      data: producto || {}
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        if (producto?.id) {
          this.productoService.actualizar(producto.id, resultado).subscribe(() => {
            this.cargarProductos();
          });
        } else {
          this.productoService.crear(resultado).subscribe(() => {
            this.cargarProductos();
          });
        }
      }
    });
  }

  eliminar(producto: Producto) {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '300px',
      data: { titulo: 'Eliminar producto', mensaje: `¿Está seguro de eliminar a ${producto.nombre}?` }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.productoService.eliminar(producto.id).subscribe(() => {
          this.cargarProductos();
        });
      }
    });
  }

  isStockBajo(producto: Producto): boolean {
    return producto.stock < producto.stockMinimo;
  }
}
