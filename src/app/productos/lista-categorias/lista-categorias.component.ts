import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { CategoriaService } from '../../shared/services/categoria.service';
import { Categoria } from '../../shared/models/models';
import { FormularioCategoriaComponent } from '../formulario-categoria/formulario-categoria.component';
import { DialogoService } from '../../shared/services/dialogo.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [
    SharedModule
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
    private dialog: MatDialog,
    private dialogoService: DialogoService
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
    this.dialogoService.confirmarEliminacion(
      'Eliminar categoría',
      `¿Está seguro de eliminar la categoría "${categoria.nombre}"?`
    ).subscribe((confirmado) => {
      if (confirmado) {
        this.categoriaService.eliminar(categoria.id!).subscribe(() => {
          this.cargarCategorias();
        });
      }
    });
  }
}
