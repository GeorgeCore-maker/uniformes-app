import { Component } from '@angular/core';
import { ListaProductosComponent } from './lista-productos/lista-productos.component';
import { ListaCategoriasComponent } from './lista-categorias/lista-categorias.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [
    ListaProductosComponent,
    ListaCategoriasComponent,
    MatTabsModule,
    MatIconModule
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss'
})
export class ProductosComponent {

}
