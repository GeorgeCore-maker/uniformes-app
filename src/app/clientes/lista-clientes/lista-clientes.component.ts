import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ClienteService } from '../../shared/services/cliente.service';
import { Cliente } from '../../shared/models/models';
import { FormularioClienteComponent } from '../formulario-cliente/formulario-cliente.component';
import { DialogoService } from '../../shared/services/dialogo.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [
    SharedModule
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
