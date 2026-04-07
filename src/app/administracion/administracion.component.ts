import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-administracion',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.scss']
})
export class AdministracionComponent implements OnInit {
  selectedTabIndex = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Escuchar cambios de navegación para actualizar el tab
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTabIndex();
      });

    // Establecer el tab inicial
    this.updateTabIndex();
  }

  private updateTabIndex(): void {
    const url = this.router.url;
    if (url.includes('usuarios')) {
      this.selectedTabIndex = 1;
    } else if (url.includes('roles')) {
      this.selectedTabIndex = 0;
    }
  }

  onTabChange(index: number): void {
    if (index === 0) {
      this.router.navigate(['roles'], { relativeTo: this.route });
    } else if (index === 1) {
      this.router.navigate(['usuarios'], { relativeTo: this.route });
    }
  }
}



