import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SharedModule } from '../../shared/shared.module';
import { ProductoService } from '../../shared/services/producto.service';
import { Producto, CategoriaProducto } from '../../shared/models/models';
import { FormularioProductoComponent } from '../formulario-producto/formulario-producto.component';
import { DialogoService } from '../../shared/services/dialogo.service';

@Component({
  selector: 'app-lista-productos',
  standalone: true,
  imports: [
    SharedModule
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
    private dialog: MatDialog,
    private dialogoService: DialogoService
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
      width: '700px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'formulario-producto-dialog',
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
    this.dialogoService.confirmarEliminacion(
      'Eliminar producto',
      `¿Está seguro de eliminar a ${producto.nombre}?`
    ).subscribe((confirmado) => {
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
