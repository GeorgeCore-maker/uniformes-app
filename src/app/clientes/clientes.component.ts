import { Component } from '@angular/core';
import { ListaClientesComponent } from './lista-clientes/lista-clientes.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [ListaClientesComponent],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent {

}
