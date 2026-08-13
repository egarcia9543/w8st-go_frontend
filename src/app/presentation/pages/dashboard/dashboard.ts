import { Component, computed, inject, LOCALE_ID } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { AnalyticsFacade } from '../../facades/analytics.facade';
import { formatMoney } from '../../pipes/format-money';

interface KpiTile {
  key: string;
  label: string;
  value: string;
  detail: string;
  valueClass: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [HlmButton, HlmCardImports, HlmSkeletonImports],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly analyticsFacade = inject(AnalyticsFacade);
  protected readonly analyticsState = this.analyticsFacade.analyticsState;
  protected readonly skeletonItems = [0, 1, 2, 3];

  private readonly locale = inject(LOCALE_ID);

  protected readonly monthLabel = computed(() => {
    const month = this.analyticsFacade.latestMonth()?.month;
    if (!month) return '';

    const label = new Date(`${month}-01T00:00:00`).toLocaleDateString(this.locale, {
      month: 'long',
      year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  protected readonly kpis = computed<KpiTile[]>(() => {
    const latest = this.analyticsFacade.latestMonth();
    if (!latest) return [];

    const money = (value: number) => formatMoney(value, latest.currency, this.locale);
    const movements = (count: number) => `${count} ${count === 1 ? 'movimiento' : 'movimientos'}`;

    return [
      {
        key: 'outOfPocket',
        label: 'De mi bolsillo',
        value: money(latest.outOfPocket),
        detail: movements(latest.counts.outOfPocket),
        valueClass: 'text-foreground',
      },
      {
        key: 'credit',
        label: 'Con crédito',
        value: money(latest.credit),
        detail: movements(latest.counts.credit),
        valueClass: 'text-foreground',
      },
      {
        key: 'income',
        label: 'Ingresos',
        value: money(latest.income),
        detail: movements(latest.counts.income),
        valueClass: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        key: 'net',
        label: 'Balance',
        value: `${latest.net > 0 ? '+' : latest.net < 0 ? '−' : ''}${money(Math.abs(latest.net))}`,
        detail: 'Ingresos menos gastos',
        valueClass:
          latest.net > 0
            ? 'text-emerald-600 dark:text-emerald-400'
            : latest.net < 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-muted-foreground',
      },
    ];
  });

  constructor() {
    this.analyticsFacade.loadAnalytics();
  }
}
