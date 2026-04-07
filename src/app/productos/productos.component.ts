import { Component } from '@angular/core';
import { ListaProductosComponent } from './lista-productos/lista-productos.component';
import { ListaCategoriasComponent } from './lista-categorias/lista-categorias.component';

import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    ListaProductosComponent,
    ListaCategoriasComponent,
    SharedModule
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent {

}
