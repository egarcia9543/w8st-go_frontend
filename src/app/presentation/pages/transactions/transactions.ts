import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmMonthYearCalendar } from '@spartan-ng/helm/calendar';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar } from '@ng-icons/lucide';
import { map } from 'rxjs';
import {
  CardKind,
  Direction,
  FundingSource,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../../../domain/entities/transaction.entity';
import { TransactionsFacade } from '../../facades/transactions.facade';
import { SignedAmountPipe } from '../../pipes/signed-amount.pipe';

type DirectionFilter = 'all' | Direction;
type SourceFilter = 'all' | FundingSource;

interface CardOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-transactions',
  imports: [
    DatePipe,
    HlmButton,
    HlmTableImports,
    HlmSkeletonImports,
    HlmMonthYearCalendar,
    NgIcon,
    SignedAmountPipe,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
  providers: [provideIcons({ lucideCalendar })],
})
export class Transactions {
  protected readonly transactionsFacade = inject(TransactionsFacade);
  protected readonly directions = Direction;
  protected readonly fundingSources = FundingSource;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly month = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('month'))), {
    initialValue: null,
  });

  protected readonly datePickerOpen = signal(false);

  protected readonly selectedDate = computed<Date | null>(() => {
    const m = this.month();
    if (!m) return null;
    const [year, monthNumber] = m.split('-').map(Number);
    if (!year || !monthNumber) return null;
    return new Date(year, monthNumber - 1, 1);
  });

  protected readonly monthLabel = computed(() => {
    const d = this.selectedDate();
    if (!d) return 'Todos los meses';
    const label = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  protected readonly skeletonRows = [0, 1, 2, 3, 4];
  protected readonly pageSizes = [10, 20, 50] as const;
  protected readonly pageSize = signal(10);
  protected readonly pageIndex = signal(0);
  protected readonly directionFilter = signal<DirectionFilter>('all');
  protected readonly sourceFilter = signal<SourceFilter>('all');
  protected readonly cardFilter = signal<string>('all');

  private readonly allTx = computed(() => this.transactionsFacade.transactionsState().transactions);

  protected readonly counts = computed(() => {
    const tx = this.allTx();
    return {
      all: tx.length,
      [Direction.INFLOW]: tx.filter((t) => t.direction === Direction.INFLOW).length,
      [Direction.OUTFLOW]: tx.filter((t) => t.direction === Direction.OUTFLOW).length,
    };
  });

  protected readonly cardOptions = computed<CardOption[]>(() => {
    const byId = new Map<string, CardOption>();

    for (const tx of this.allTx()) {
      if (!tx.card || byId.has(tx.card.id)) continue;
      byId.set(tx.card.id, {
        id: tx.card.id,
        label: tx.card.alias ?? `${CARD_KIND_LABELS[tx.card.kind]} *${tx.card.last4}`,
      });
    }

    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
  });

  protected readonly hasActiveFilters = computed(
    () =>
      this.directionFilter() !== 'all' ||
      this.sourceFilter() !== 'all' ||
      this.cardFilter() !== 'all',
  );

  protected readonly filtered = computed(() => {
    const direction = this.directionFilter();
    const source = this.sourceFilter();
    const cardId = this.cardFilter();

    return this.allTx().filter((tx) => {
      if (direction !== 'all' && tx.direction !== direction) return false;
      if (source !== 'all' && tx.fundingSource !== source) return false;
      if (cardId !== 'all' && tx.card?.id !== cardId) return false;
      return true;
    });
  });

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize())),
  );

  protected readonly page = computed(() => Math.min(this.pageIndex(), this.totalPages() - 1));

  protected readonly paged = computed(() => {
    const start = this.page() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((p) => this.transactionsFacade.loadTransactions(p.get('month') ?? undefined));
  }

  onMonthChange(month: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { month: month || null },
      queryParamsHandling: 'merge',
    });
  }

  onDateSelected(date: Date): void {
    const year = date.getFullYear();
    const monthNumber = String(date.getMonth() + 1).padStart(2, '0');
    this.datePickerOpen.set(false);
    this.onMonthChange(`${year}-${monthNumber}`);
  }

  setDirectionFilter(filter: DirectionFilter): void {
    this.directionFilter.set(filter);
    this.pageIndex.set(0);
  }

  setSourceFilter(filter: string): void {
    this.sourceFilter.set(filter as SourceFilter);
    this.pageIndex.set(0);
  }

  setCardFilter(cardId: string): void {
    this.cardFilter.set(cardId);
    this.pageIndex.set(0);
  }

  clearFilters(): void {
    this.directionFilter.set('all');
    this.sourceFilter.set('all');
    this.cardFilter.set('all');
    this.pageIndex.set(0);
  }

  setPageSize(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(0);
  }

  nextPage(): void {
    this.pageIndex.set(Math.min(this.page() + 1, this.totalPages() - 1));
  }

  prevPage(): void {
    this.pageIndex.set(Math.max(this.page() - 1, 0));
  }

  typeLabel(type: TransactionType): string {
    return TYPE_LABELS[type] ?? this.humanize(type);
  }

  private humanize(type: string): string {
    const label = type.replace(/_/g, ' ');
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  methodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.ACCOUNT:
        return 'Cuenta';
      case PaymentMethod.DEBIT_CARD:
        return 'Tarjeta débito';
      case PaymentMethod.CREDIT_CARD:
        return 'Tarjeta crédito';
    }
  }

  counterparty(tx: Transaction): string {
    return tx.merchant ?? tx.counterpartyName ?? '—';
  }

  amountClass(tx: Transaction): string {
    if (tx.fundingSource === FundingSource.INTERNAL || tx.excludeFromSpending) {
      return 'text-muted-foreground';
    }
    return tx.direction === Direction.INFLOW
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-red-600 dark:text-red-400';
  }
}

const CARD_KIND_LABELS: Record<string, string> = {
  [CardKind.CREDIT]: 'Crédito',
  [CardKind.DEBIT]: 'Débito',
  [CardKind.ACCOUNT]: 'Cuenta',
};

const TYPE_LABELS: Record<string, string> = {
  [TransactionType.PURCHASE]: 'Compra',
  [TransactionType.TRANSFER]: 'Transferencia',
  [TransactionType.PAYMENT]: 'Pago',
  [TransactionType.PAYROLL]: 'Nómina',
  [TransactionType.SUPPLIER_PAYMENT]: 'Pago recibido',
  [TransactionType.WITHDRAWAL]: 'Retiro',
  [TransactionType.CASH_ADVANCE]: 'Avance',
};
