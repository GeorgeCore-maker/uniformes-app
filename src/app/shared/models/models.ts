// Enums
export enum UserRole {
  ADMIN = 'ADMIN',
  VENDEDOR = 'VENDEDOR',
  OPERARIO = 'OPERARIO'
}
export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  EN_CONFECCION = 'EN_CONFECCION',
  TERMINADO = 'TERMINADO',
  ENVIADO = 'ENVIADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}

export enum CategoriaProducto {
  UNIFORMES_ESCOLARES = 'UNIFORMES_ESCOLARES',
  TRAJES_MEDICOS = 'TRAJES_MEDICOS',
  DOTACION_SERVICIOS = 'DOTACION_SERVICIOS'
}

export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  habilitado: boolean;
  fechaDeshabilitado?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interfaces
export interface Rol {
  id: number;
  nombre: string;
  descripcion?: string;
  permisos: string[];
  activo: boolean;
  habilitado: boolean;  // Borrado lógico
  fechaDeshabilitado?: string;  // Fecha y hora del deshabilitado
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  nit?: string;
  habilitado: boolean;  // Borrado lógico
  fechaDeshabilitado?: string;  // Fecha y hora del deshabilitado
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  categoria: CategoriaProducto;
  talla?: string;
  precio: number;
  costo: number;
  stock: number;
  stockMinimo: number;
  imagen?: string;
  requiereConfeccion: boolean;  // Si el producto necesita ser confeccionado
  habilitado: boolean;  // Borrado lógico
  fechaDeshabilitado?: string;  // Fecha y hora del deshabilitado
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DetallePedido {
  id: number;
  productoId: number;
  producto?: Producto;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  clienteId: number;
  cliente?: Cliente;
  numero: string;
  estado: EstadoPedido;
  detalles: DetallePedido[];
  subtotal: number;
  impuesto?: number;
  total: number;
  margen?: number;
  fechaCreacion: Date;
  fechaEntrega?: Date;
  observaciones?: string;
  habilitado: boolean;  // Borrado lógico
  fechaDeshabilitado?: string;  // Fecha y hora del deshabilitado
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Usuario {
  id: number;
  username: string;
  password: string;
  email?: string;
  role: UserRole | string;
  rolId?: number;
  token?: string;
  activo?: boolean;
  habilitado: boolean;  // Borrado lógico
  fechaDeshabilitado?: string;  // Fecha y hora del deshabilitado
  createdAt?: Date;
  updatedAt?: Date;
}
