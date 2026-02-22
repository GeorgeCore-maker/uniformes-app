import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Pedido, Producto, Cliente, EstadoPedido } from '../../shared/models/models';
import { ProductoService } from '../../productos/producto.service';
import { ClienteService } from '../../clientes/cliente.service';

@Component({
  selector: 'app-formulario-pedido',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './formulario-pedido.component.html',
  styleUrl: './formulario-pedido.component.scss'
})
export class FormularioPedidoComponent implements OnInit {
  formulario: FormGroup;
  productos: Producto[] = [];
  clientes: Cliente[] = [];
  estados = Object.values(EstadoPedido);
  displayedColumns: string[] = ['productoId', 'cantidad', 'precioUnitario', 'subtotal', 'eliminar'];

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Pedido,
    public dialogRef: MatDialogRef<FormularioPedidoComponent>,
    private productoService: ProductoService,
    private clienteService: ClienteService
  ) {
    this.formulario = this.fb.group({
      numero: [data?.numero || '', Validators.required],
      clienteId: [data?.clienteId || '', Validators.required],
      estado: [data?.estado || EstadoPedido.PENDIENTE, Validators.required],
      detalles: this.fb.array(data?.detalles?.map(d =>
        this.fb.group({
          productoId: [d.productoId, Validators.required],
          cantidad: [d.cantidad, [Validators.required, Validators.min(1)]],
          precioUnitario: [d.precioUnitario, [Validators.required, Validators.min(0)]]
        })
      ) || []),
      subtotal: [data?.subtotal || 0],
      total: [data?.total || 0],
      margen: [data?.margen || 0]
    });
  }

  ngOnInit() {
    this.cargarProductos();
    this.cargarClientes();
  }

  cargarProductos() {
    this.productoService.obtenerTodos().subscribe(p => this.productos = p);
  }

  cargarClientes() {
    this.clienteService.obtenerTodos().subscribe(c => this.clientes = c);
  }

  get detalles(): FormArray {
    return this.formulario.get('detalles') as FormArray;
  }

  agregarDetalle() {
    this.detalles.push(
      this.fb.group({
        productoId: ['', Validators.required],
        cantidad: ['', [Validators.required, Validators.min(1)]],
        precioUnitario: ['', [Validators.required, Validators.min(0)]]
      })
    );
  }

  eliminarDetalle(index: number) {
    this.detalles.removeAt(index);
    this.calcularTotales();
  }

  calcularTotales() {
    let subtotal = 0;
    this.detalles.controls.forEach(detalle => {
      const cantidad = detalle.get('cantidad')?.value || 0;
      const precio = detalle.get('precioUnitario')?.value || 0;
      subtotal += cantidad * precio;
    });

    const total = subtotal * 1.19; // IVA 19%
    const margen = total - subtotal;

    this.formulario.patchValue({
      subtotal: subtotal,
      total: total,
      margen: margen
    });
  }

  getProductoIdControl(i: number): FormControl {
    return this.detalles.at(i).get('productoId') as FormControl;
  }

  getCantidadControl(i: number): FormControl {
    return this.detalles.at(i).get('cantidad') as FormControl;
  }

  getPrecioControl(i: number): FormControl {
    return this.detalles.at(i).get('precioUnitario') as FormControl;
  }

  guardar() {
    this.calcularTotales();
    if (this.formulario.valid && this.detalles.length > 0) {
      const valor = this.formulario.value;
      this.dialogRef.close(valor);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }

  getProductoNombre(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto?.nombre || '';
  }
}
