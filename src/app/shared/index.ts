// Componentes compartidos
export { DialogoConfirmacionComponent } from './components/dialogo-confirmacion/dialogo-confirmacion.component';
export type { DialogoConfirmacionData } from './components/dialogo-confirmacion/dialogo-confirmacion.component';

// Servicios compartidos
export { DialogoService } from './services/dialogo.service';

// Servicios CRUD unificados
export { CrudService } from './services/crud.service';
export type { FiltroOptions, RespuestaPaginada } from './services/crud.service';

// Servicios especializados
export { ClienteService } from './services/cliente.service';
export { ProductoService } from './services/producto.service';
export { PedidoService } from './services/pedido.service';
export { ProduccionService } from './services/produccion.service';

// Modelos
export * from './models/models';
