import { computed, inject, Injectable, signal } from '@angular/core';
import { GetAnalyticsUseCase } from '../../application/use-cases/get-analytics/get-analytics.use-case';
import { GetCardSpendUseCase } from '../../application/use-cases/get-card-spend/get-card-spend.use-case';
import { MonthlyAnalytics } from '../../domain/entities/analytics.entity';
import { CardSpend } from '../../domain/entities/card-spend.entity';
import { CardKind, Currency } from '../../domain/entities/transaction.entity';

export interface AnalyticsState {
  analytics: MonthlyAnalytics[];
  loading: boolean;
  error: boolean;
}

export interface CardSpendState {
  cards: CardSpend[];
  loading: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsFacade {
  private readonly getAnalyticsUseCase = inject(GetAnalyticsUseCase);

  private readonly initialState: AnalyticsState = { analytics: [], loading: false, error: false };
  private readonly _analyticsState = signal<AnalyticsState>({ ...this.initialState });
  readonly analyticsState = this._analyticsState.asReadonly();

  readonly primaryCurrencyMonths = computed(() =>
    this._analyticsState()
      .analytics.filter((row) => row.currency === Currency.COP)
      .sort((a, b) => a.month.localeCompare(b.month)),
  );

  readonly latestMonth = computed<MonthlyAnalytics | null>(() => {
    const months = this.primaryCurrencyMonths();
    return months.length > 0 ? months[months.length - 1] : null;
  });

  readonly otherCurrencies = computed(() =>
    this._analyticsState().analytics.filter((row) => row.currency !== Currency.COP),
  );

  loadAnalytics(from?: string, to?: string): void {
    this._analyticsState.set({ analytics: [], loading: true, error: false });

    this.getAnalyticsUseCase.execute(from, to).subscribe({
      next: (analytics) => this._analyticsState.set({ analytics, loading: false, error: false }),
      error: () => this._analyticsState.set({ analytics: [], loading: false, error: true }),
    });
  }

  private readonly getCardSpendUseCase = inject(GetCardSpendUseCase);

  private readonly _cardSpendState = signal<CardSpendState>({
    cards: [],
    loading: false,
    error: false,
  });
  readonly cardSpendState = this._cardSpendState.asReadonly();

  readonly creditCards = computed(() =>
    this._cardSpendState().cards.filter((card) => card.kind === CardKind.CREDIT),
  );

  readonly ownFundsCards = computed(() =>
    this._cardSpendState().cards.filter((card) => card.kind !== CardKind.CREDIT),
  );

  loadCardSpend(month?: string): void {
    this._cardSpendState.set({ cards: [], loading: true, error: false });

    this.getCardSpendUseCase.execute(month).subscribe({
      next: (cards) => this._cardSpendState.set({ cards, loading: false, error: false }),
      error: () => this._cardSpendState.set({ cards: [], loading: false, error: true }),
    });
  }
}
