import { Component, computed, inject } from '@angular/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHouse,
  lucideInbox,
  lucideCalendar,
  lucideSearch,
  lucideSettings,
  lucideLogOut,
} from '@ng-icons/lucide';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacade } from '../../../facades/auth.facade';

@Component({
  selector: 'app-side-menu',
  imports: [HlmSidebarImports, NgIcon, RouterLink, RouterLinkActive],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.scss',
  providers: [
    provideIcons({
      lucideHouse,
      lucideInbox,
      lucideCalendar,
      lucideSearch,
      lucideSettings,
      lucideLogOut,
    }),
  ],
})
export class SideMenu {
  private readonly authFacade = inject(AuthFacade);
  private readonly router = inject(Router);

  protected readonly userName = computed(
    () => this.authFacade.sessionState().user?.userName ?? '',
  );
  protected readonly userEmail = computed(
    () => this.authFacade.sessionState().user?.userEmail ?? '',
  );

  protected readonly _items = [
    {
      title: 'Dashboard',
      url: 'dashboard',
      icon: 'lucideHouse',
    },
    {
      title: 'Transacciones',
      url: 'transacciones',
      icon: 'lucideInbox',
    },
  ];

  logout(): void {
    this.authFacade.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
