import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-container',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './page-container.component.html',
  styleUrls: ['./page-container.component.scss']
})
export class PageContainerComponent {
  @Input() titulo = '';
  @Input() subtitulo?: string;
  @Input() icono?: string;
}
