import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Pedido, Producto, Cliente, EstadoPedido } from '../../shared/models/models';
import { ProductoService } from '../../shared/services/producto.service';
import { ClienteService } from '../../shared/services/cliente.service';
import { PedidoService } from '../../shared/services/pedido.service';
import { ProduccionService } from '../../shared/services/produccion.service';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-formulario-pedido',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './formulario-pedido.component.html',
  styleUrl: './formulario-pedido.component.scss'
})
export class FormularioPedidoComponent implements OnInit {
  formulario: FormGroup;
  productos: Producto[] = [];
  clientes: Cliente[] = [];
  estados = Object.values(EstadoPedido);
  displayedColumns: string[] = ['productoId', 'cantidad', 'precioUnitario', 'estado', 'subtotal', 'eliminar'];
  numeroPedido: string = '';
  dataSource = new MatTableDataSource<FormGroup>([]);

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: Pedido,
    public dialogRef: MatDialogRef<FormularioPedidoComponent>,
    private productoService: ProductoService,
    private clienteService: ClienteService,
    private pedidoService: PedidoService,
    private produccionService: ProduccionService
  ) {
    this.formulario = this.fb.group({
      numero: [data?.numero || '', Validators.required],
      clienteId: [data?.clienteId || '', Validators.required],
      observaciones: [data?.observaciones || ''], // Campo para observaciones del pedido
      incluirIva: [data?.incluirIva !== undefined ? data.incluirIva : true], // IVA habilitado por defecto
      detalles: this.fb.array([]),
      subtotal: [data?.subtotal || 0],
      total: [data?.total || 0],
      margen: [data?.margen || 0]
    });

    // Inicializar detalles después de crear el FormArray vacío
    if (data?.detalles) {
      data.detalles.forEach(detalle => {
        const detalleFormGroup = this.crearDetalleFormGroup(detalle);
        this.detalles.push(detalleFormGroup);

        // Agregar suscripciones a los controles existentes
        this.agregarSuscripcionesDetalle(detalleFormGroup);
      });
    }

    // Inicializar el dataSource
    this.actualizarDataSource();
  }

  ngOnInit() {
    this.cargarProductos();
    this.cargarClientes();
    this.generarNumeroPedido();

    // Escuchar cambios en el checkbox de IVA para recalcular totales
    this.formulario.get('incluirIva')?.valueChanges.subscribe(() => {
      this.calcularTotales();
    });
  }

  cargarProductos() {
    this.productoService.obtenerTodos().subscribe(p => {
      this.productos = p;
      this.actualizarEstadosSegunProductos(); // Actualizar estados después de cargar productos
    });
  }

  cargarClientes() {
    this.clienteService.obtenerTodos().subscribe(c => this.clientes = c);
  }

  actualizarEstadosSegunProductos() {
    // Actualizar estados de detalles existentes que no tenían estado definido originalmente
    this.detalles.controls.forEach((detalle, index) => {
      const productoId = detalle.get('productoId')?.value;
      const estadoActual = detalle.get('estado')?.value;

      // Solo actualizar si el estado es PENDIENTE (valor por defecto) y no había estado original
      if (estadoActual === EstadoPedido.PENDIENTE && productoId &&
          (!this.data?.detalles?.[index] || !this.data.detalles[index].estado)) {
        const estadoCorrect = this.obtenerEstadoInicialPorProducto(productoId);
        detalle.get('estado')?.setValue(estadoCorrect);
      }
    });
  }

  obtenerEstadoInicialPorProducto(productoId: number): EstadoPedido {
    const producto = this.productos.find(p => p.id === productoId);
    if (producto && producto.requiereConfeccion) {
      return EstadoPedido.PENDIENTE; // Los productos que requieren confección empiezan como PENDIENTE
    }
    return EstadoPedido.TERMINADO; // Los productos que no requieren confección están TERMINADOS
  }

  generarNumeroPedido() {
    // Solo generar número si es un nuevo pedido
    if (!this.data?.id) {
      this.pedidoService.generarSiguienteNumero().subscribe(numero => {
        this.numeroPedido = numero;
        this.formulario.patchValue({ numero: numero });
      });
    } else {
      this.numeroPedido = this.data.numero;
    }
  }

  get detalles(): FormArray {
    return this.formulario.get('detalles') as FormArray;
  }

  crearDetalleFormGroup(detalle?: any): FormGroup {
    return this.fb.group({
      productoId: [detalle?.productoId || '', Validators.required],
      cantidad: [detalle?.cantidad || '', [Validators.required, Validators.min(1)]],
      precioUnitario: [detalle?.precioUnitario || '', [Validators.required, Validators.min(0)]],
      estado: [detalle?.estado || EstadoPedido.PENDIENTE, Validators.required]
    });
  }

  private actualizarDataSource() {
    this.dataSource.data = [...this.detalles.controls] as FormGroup[];
  }

  agregarDetalle() {
    const nuevoDetalle = this.crearDetalleFormGroup();
    this.detalles.push(nuevoDetalle);
    this.agregarSuscripcionesDetalle(nuevoDetalle);

    // Actualizar el dataSource para reflejar los cambios en la tabla
    this.actualizarDataSource();
  }

  private agregarSuscripcionesDetalle(detalle: FormGroup) {
    // Suscribirse al cambio de productoId para actualizar el precio y estado automáticamente
    detalle.get('productoId')?.valueChanges.subscribe((productoId: any) => {
      if (productoId) {
        const producto = this.productos.find(p => p.id === Number(productoId));
        if (producto) {
          const estadoInicial = this.obtenerEstadoInicialPorProducto(Number(productoId));
          detalle.patchValue({
            precioUnitario: producto.precio.toString(),
            estado: estadoInicial
          });
          this.calcularTotales();
        }
      }
    });

    // También suscribirse a cambios de cantidad y precio para recalcular
    detalle.get('cantidad')?.valueChanges.subscribe(() => {
      this.calcularTotales();
    });

    detalle.get('precioUnitario')?.valueChanges.subscribe(() => {
      this.calcularTotales();
    });
  }

  eliminarDetalle(index: number) {
    this.detalles.removeAt(index);
    this.calcularTotales();

    // Actualizar el dataSource
    this.actualizarDataSource();
  }

  calcularTotales() {
    let subtotal = 0;
    this.detalles.controls.forEach(detalle => {
      const cantidad = detalle.get('cantidad')?.value || 0;
      const precio = detalle.get('precioUnitario')?.value || 0;
      subtotal += cantidad * precio;
    });

    // Aplicar IVA condicionalmente según el checkbox
    const aplicarIva = this.formulario.get('incluirIva')?.value;
    const impuesto = aplicarIva ? subtotal * 0.19 : 0; // IVA 19% o 0%
    const total = subtotal + impuesto;

    this.formulario.patchValue({
      subtotal: subtotal,
      total: total,
      margen: impuesto
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

  getEstadoControl(i: number): FormControl {
    return this.detalles.at(i).get('estado') as FormControl;
  }

  guardar() {
    this.calcularTotales();
    if (this.formulario.valid && this.detalles.length > 0) {
      const valorFormulario = this.formulario.value;

      // Si es edición, preservar las propiedades originales del pedido
      const resultado = this.data && this.data.id ? {
        ...this.data, // Propiedades originales del pedido
        ...valorFormulario, // Valores actualizados del formulario
        id: this.data.id // Asegurar que el ID se mantenga
      } : valorFormulario; // Para nuevos pedidos, usar solo los valores del formulario

      // Agregar flag para indicar si se debe crear items de producción
      resultado.crearItemsProduccion = !this.data || !this.data.id; // Solo para pedidos nuevos

      this.dialogRef.close(resultado);
    }
  }

  cancelar() {
    this.dialogRef.close();
  }

  getProductoNombre(productoId: number): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto?.nombre || '';
  }

  getProducto(productoId: number): Producto | undefined {
    return this.productos.find(p => p.id === productoId);
  }
}
