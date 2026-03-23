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
import { ClienteService } from '../cliente.service';
import { Cliente } from '../../shared/models/models';
import { FormularioClienteComponent } from '../formulario-cliente/formulario-cliente.component';
import { DialogoService } from '../../shared';

@Component({
  selector: 'app-lista-clientes',
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
    MatDialogModule
  ],
  templateUrl: './lista-clientes.component.html',
  styleUrl: './lista-clientes.component.scss'
})
export class ListaClientesComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'telefono', 'email', 'ciudad', 'acciones'];
  pageSizeOptions: number[] = [5, 10, 25];
  pageSize = 5;
  currentPage = 0;
  totalItems = 0;

  filtroNombre = '';
  filtroTelefono = '';

  constructor(
    private clienteService: ClienteService,
    private dialog: MatDialog,
    private dialogoService: DialogoService
  ) {}

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.clienteService.obtenerTodos().subscribe((clientes) => {
      this.clientes = clientes;
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    this.clientesFiltrados = this.clientes.filter((cliente) => {
      const coincideNombre = cliente.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());
      const coincideTelefono = cliente.telefono.includes(this.filtroTelefono);
      return coincideNombre && coincideTelefono;
    });

    this.totalItems = this.clientesFiltrados.length;
    this.currentPage = 0;
  }

  get clientesPaginados(): Cliente[] {
    const inicio = this.currentPage * this.pageSize;
    const fin = inicio + this.pageSize;
    return this.clientesFiltrados.slice(inicio, fin);
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
    this.filtroTelefono = '';
    this.aplicarFiltros();
  }

  abrirFormulario(cliente?: Cliente) {
    const dialogRef = this.dialog.open(FormularioClienteComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'formulario-cliente-dialog',
      data: cliente || {}
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        if (cliente?.id) {
          this.clienteService.actualizar(cliente.id, resultado).subscribe(() => {
            this.cargarClientes();
          });
        } else {
          this.clienteService.crear(resultado).subscribe(() => {
            this.cargarClientes();
          });
        }
      }
    });
  }

  eliminar(cliente: Cliente) {
    this.dialogoService.confirmarEliminacion(
      'Eliminar cliente',
      `¿Está seguro de eliminar a ${cliente.nombre}?`
    ).subscribe((confirmado) => {
      if (confirmado) {
        this.clienteService.eliminar(cliente.id).subscribe(() => {
          this.cargarClientes();
        });
      }
    });
  }
}
