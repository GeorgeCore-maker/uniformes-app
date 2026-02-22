import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../core/services/notification.service';

interface NavLink {
  label: string;
  icon: string;
  route: string;
  roles?: string[]; // Roles permitidos para este menú
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatExpansionModule,
    RouterModule
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  username: string | null = null;
  userRole: string | null = null;
  isMobile = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getRole();
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.checkIfMobile());
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth < 768;
  }

  toggleSidenav() {
    if (this.sidenav) {
      this.sidenav.toggle();
    }
  }

  closeSidenav() {
    if (this.isMobile && this.sidenav) {
      this.sidenav.close();
    }
  }

  logout() {
    this.notificationService.info('Cerrando sesión...');
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Menús disponibles según el rol del usuario
   */
  navLinks: NavLink[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Clientes', icon: 'people', route: '/clientes' },
    { label: 'Productos', icon: 'inventory', route: '/productos' },
    { label: 'Pedidos', icon: 'shopping_cart', route: '/pedidos' },
    { label: 'Producción', icon: 'build', route: '/produccion', roles: ['OPERARIO', 'ADMIN'] },
    { label: 'Inventario', icon: 'warehouse', route: '/inventario', roles: ['ADMIN'] },
    { label: 'Administración', icon: 'admin_panel_settings', route: '/administracion', roles: ['ADMIN'] }
  ];

  /**
   * Filtrar menús según el rol del usuario
   */
  get navLinksFiltered(): NavLink[] {
    return this.navLinks.filter(link => {
      // Si el menú no tiene roles especificados, está disponible para todos
      if (!link.roles) {
        return true;
      }
      // Si el menú tiene roles especificados, solo mostrar si el usuario tiene ese rol
      return link.roles.includes(this.userRole || '');
    });
  }

  /**
   * Verificar si el usuario es ADMIN
   */
  get isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }
}
