import { Component } from '@angular/core';
import { ListaPedidosComponent } from './lista-pedidos/lista-pedidos.component';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [ListaPedidosComponent],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.scss'
})
export class PedidosComponent {

}
