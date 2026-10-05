import { Component, computed, inject } from '@angular/core';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHouse,
  lucideInbox,
  lucideCalendar,
  lucideCreditCard,
  lucideGift,
  lucideSearch,
  lucideSettings,
  lucideLogOut,
  lucideMail,
} from '@ng-icons/lucide';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacade } from '../../../facades/auth.facade';
import { TransactionsFacade } from '../../../facades/transactions.facade';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
  badge?: () => number;
  badgeTooltip?: string;
}

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
      lucideCreditCard,
      lucideGift,
      lucideSearch,
      lucideSettings,
      lucideLogOut,
      lucideMail,
    }),
  ],
})
export class SideMenu {
  private readonly authFacade = inject(AuthFacade);
  private readonly transactionsFacade = inject(TransactionsFacade);
  private readonly router = inject(Router);

  protected readonly userName = computed(
    () => this.authFacade.sessionState().user?.userName ?? '',
  );
  protected readonly userEmail = computed(
    () => this.authFacade.sessionState().user?.userEmail ?? '',
  );

  protected readonly _items: MenuItem[] = [
    {
      title: 'Dashboard',
      url: 'dashboard',
      icon: 'lucideHouse',
    },
    {
      title: 'Transacciones',
      url: 'transacciones',
      icon: 'lucideInbox',
      badge: this.transactionsFacade.uncategorizedCount,
      badgeTooltip: 'gastos de este mes sin clasificar',
    },
    {
      title: 'Tarjetas',
      url: 'tarjetas',
      icon: 'lucideCreditCard',
    },
    {
      title: 'Wishlist',
      url: 'wishlist',
      icon: 'lucideGift',
    },
  ];

  constructor() {
    this.transactionsFacade.loadUncategorizedCount();
  }

  signInWithGoogle(): void {
    this.authFacade.signInWithGoogle();
  }

  logout(): void {
    this.authFacade.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
