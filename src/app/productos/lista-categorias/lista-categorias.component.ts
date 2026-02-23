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
import { MatTooltipModule } from '@angular/material/tooltip';
import { CategoriaService } from '../categoria.service';
import { Categoria } from '../../shared/models/models';
import { FormularioCategoriaComponent } from '../formulario-categoria/formulario-categoria.component';
import { DialogoConfirmacionComponent } from '../dialogo-confirmacion/dialogo-confirmacion.component';

@Component({
  selector: 'app-lista-categorias',
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
    MatTooltipModule
  ],
  templateUrl: './lista-categorias.component.html',
  styleUrl: './lista-categorias.component.scss'
})
export class ListaCategoriasComponent implements OnInit {
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'descripcion', 'acciones'];
  pageSizeOptions: number[] = [5, 10, 25];
  pageSize = 5;
  currentPage = 0;
  totalItems = 0;

  filtroBusqueda = '';

  constructor(
    private categoriaService: CategoriaService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.categoriaService.obtenerTodas().subscribe((categorias) => {
      this.categorias = categorias;
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    this.categoriasFiltradas = this.categorias.filter((categoria) => {
      const coincide = categoria.nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
                       (categoria.descripcion || '').toLowerCase().includes(this.filtroBusqueda.toLowerCase());
      return coincide;
    });

    this.totalItems = this.categoriasFiltradas.length;
    this.currentPage = 0;
  }

  get categoriasPaginadas(): Categoria[] {
    const inicio = this.currentPage * this.pageSize;
    const fin = inicio + this.pageSize;
    return this.categoriasFiltradas.slice(inicio, fin);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  buscar() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtroBusqueda = '';
    this.aplicarFiltros();
  }

  abrirFormulario(categoria?: Categoria) {
    const dialogRef = this.dialog.open(FormularioCategoriaComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'formulario-categoria-dialog',
      data: categoria || {}
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        if (categoria?.id) {
          this.categoriaService.actualizar(categoria.id, resultado).subscribe(() => {
            this.cargarCategorias();
          });
        } else {
          this.categoriaService.crear(resultado).subscribe(() => {
            this.cargarCategorias();
          });
        }
      }
    });
  }

  eliminar(categoria: Categoria) {
    const dialogRef = this.dialog.open(DialogoConfirmacionComponent, {
      width: '400px',
      maxWidth: '90vw',
      panelClass: 'dialogo-confirmacion-dialog',
      data: { titulo: 'Eliminar categoría', mensaje: `¿Está seguro de eliminar la categoría "${categoria.nombre}"?` }
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        this.categoriaService.eliminar(categoria.id!).subscribe(() => {
          this.cargarCategorias();
        });
      }
    });
  }
}
