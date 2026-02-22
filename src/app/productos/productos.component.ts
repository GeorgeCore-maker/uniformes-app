import { Component } from '@angular/core';
import { ListaProductosComponent } from './lista-productos/lista-productos.component';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [ListaProductosComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent {

}
