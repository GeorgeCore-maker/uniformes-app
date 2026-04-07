import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterModule, Router } from '@angular/router';
import { SharedModule } from '../shared.module';
import { AuthService } from '../../auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../core/services/notification.service';
import { InactivityService } from '../../core/services/inactivity.service';

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
    SharedModule,
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

  // Variables para el reloj de inactividad
  timeRemaining: number = 0;
  showInactivityClock = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private inactivityService: InactivityService
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername();
    this.userRole = this.authService.getRole();
    this.checkIfMobile();
    window.addEventListener('resize', () => this.checkIfMobile());

    // Iniciar monitoreo de inactividad
    this.inactivityService.startMonitoring();

    // Suscribirse al tiempo restante
    this.inactivityService.timeRemaining$
      .pipe(takeUntil(this.destroy$))
      .subscribe(timeRemaining => {
        this.timeRemaining = timeRemaining;
        // Mostrar reloj solo cuando quede menos de 2 minutos
        this.showInactivityClock = timeRemaining < 2 * 60 * 1000;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', () => this.checkIfMobile());

    // Detener monitoreo de inactividad
    this.inactivityService.stopMonitoring();
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

    // Detener monitoreo de inactividad antes de cerrar sesión
    this.inactivityService.stopMonitoring();

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

  /**
   * Formatear tiempo restante en formato MM:SS
   */
  get formattedTimeRemaining(): string {
    const totalSeconds = Math.floor(this.timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Obtener clase de estado según el tiempo restante
   */
  get clockStatusClass(): string {
    if (this.timeRemaining < 30 * 1000) { // Menos de 30 segundos
      return 'critical';
    } else if (this.timeRemaining < 60 * 1000) { // Menos de 1 minuto
      return 'warning';
    }
    return 'normal';
  }
}
