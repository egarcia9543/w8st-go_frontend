import { DatePipe } from '@angular/common';
import { Component, computed, inject, LOCALE_ID, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmMonthYearCalendar } from '@spartan-ng/helm/calendar';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar } from '@ng-icons/lucide';
import { map } from 'rxjs';
import {
  CardKind,
  Direction,
  FundingSource,
  isClassifiable,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../../../domain/entities/transaction.entity';
import { Category } from '../../../domain/entities/category.entity';
import { CategoriesFacade } from '../../facades/categories.facade';
import { TransactionsFacade } from '../../facades/transactions.facade';
import { formatMoney } from '../../pipes/format-money';
import { SignedAmountPipe } from '../../pipes/signed-amount.pipe';

type DirectionFilter = 'all' | Direction;
type SourceFilter = 'all' | FundingSource;

const CATEGORY_FILTER_ALL = 'all';
const CATEGORY_FILTER_NONE = 'none';

interface CardOption {
  id: string;
  label: string;
}

interface CategoryOptionGroup {
  label: string;
  categories: Category[];
}

interface CurrencyTotal {
  currency: string;
  count: number;
  hasBoth: boolean;
  inflowLabel: string;
  outflowLabel: string;
  netLabel: string;
  netClass: string;
}

@Component({
  selector: 'app-transactions',
  imports: [
    DatePipe,
    HlmButton,
    HlmTableImports,
    HlmSkeletonImports,
    HlmMonthYearCalendar,
    HlmSelectImports,
    NgIcon,
    SignedAmountPipe,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
  providers: [provideIcons({ lucideCalendar })],
})
export class Transactions {
  protected readonly transactionsFacade = inject(TransactionsFacade);
  protected readonly categoriesFacade = inject(CategoriesFacade);
  protected readonly classifiable = isClassifiable;
  protected readonly categoryFilterAll = CATEGORY_FILTER_ALL;
  protected readonly categoryFilterNone = CATEGORY_FILTER_NONE;
  protected readonly directions = Direction;
  protected readonly fundingSources = FundingSource;
  private readonly locale = inject(LOCALE_ID);
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
  protected readonly categoryFilter = signal<string>(CATEGORY_FILTER_ALL);
  protected readonly selectedIds = signal<ReadonlySet<string>>(new Set());

  protected readonly categoryGroups = computed<CategoryOptionGroup[]>(() => {
    const catalog = this.categoriesFacade.state().catalog;
    if (!catalog) return [];

    const groups = catalog.groups
      .filter((group) => group.categories.length > 0)
      .map((group) => ({ label: group.name, categories: group.categories }));

    return catalog.ungrouped.length > 0
      ? [...groups, { label: 'Sin grupo', categories: catalog.ungrouped }]
      : groups;
  });

  protected readonly categoryFilterToLabel = (value: string): string => {
    if (value === CATEGORY_FILTER_ALL) return 'Toda categoría';
    if (value === CATEGORY_FILTER_NONE) return 'Sin clasificar';
    return this.categoriesFacade.byId().get(value)?.name ?? value;
  };

  protected readonly sourceOptions: ReadonlyArray<{ value: string; label: string }> = [
    { value: 'all', label: 'Toda fuente' },
    { value: FundingSource.OWN_FUNDS, label: 'De mi bolsillo' },
    { value: FundingSource.CREDIT, label: 'Con crédito' },
    { value: FundingSource.INTERNAL, label: 'Movimientos internos' },
  ];

  protected readonly sourceToLabel = (value: string): string =>
    this.sourceOptions.find((option) => option.value === value)?.label ?? value;

  protected readonly cardToLabel = (id: string): string =>
    id === 'all'
      ? 'Todos los productos'
      : (this.cardOptions().find((card) => card.id === id)?.label ?? id);

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

  protected readonly pendingCount = computed(
    () => this.allTx().filter((tx) => isClassifiable(tx) && !tx.category).length,
  );

  protected readonly hasActiveFilters = computed(
    () =>
      this.directionFilter() !== 'all' ||
      this.sourceFilter() !== 'all' ||
      this.cardFilter() !== 'all' ||
      this.categoryFilter() !== CATEGORY_FILTER_ALL,
  );

  protected readonly filtered = computed(() => {
    const direction = this.directionFilter();
    const source = this.sourceFilter();
    const cardId = this.cardFilter();
    const categoryId = this.categoryFilter();

    return this.allTx().filter((tx) => {
      if (direction !== 'all' && tx.direction !== direction) return false;
      if (source !== 'all' && tx.fundingSource !== source) return false;
      if (cardId !== 'all' && tx.card?.id !== cardId) return false;
      if (categoryId === CATEGORY_FILTER_NONE && (!isClassifiable(tx) || tx.category)) return false;
      if (
        categoryId !== CATEGORY_FILTER_ALL &&
        categoryId !== CATEGORY_FILTER_NONE &&
        tx.category?.id !== categoryId
      ) {
        return false;
      }
      return true;
    });
  });

  protected readonly totals = computed<CurrencyTotal[]>(() => {
    const byCurrency = new Map<string, { inflow: number; outflow: number; count: number }>();

    for (const tx of this.filtered()) {
      const entry = byCurrency.get(tx.currency) ?? { inflow: 0, outflow: 0, count: 0 };
      entry.count += 1;

      const isInternal = tx.fundingSource === FundingSource.INTERNAL || tx.excludeFromSpending;
      if (!isInternal) {
        if (tx.direction === Direction.INFLOW) entry.inflow += tx.amount;
        else entry.outflow += tx.amount;
      }

      byCurrency.set(tx.currency, entry);
    }

    return [...byCurrency.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([currency, { inflow, outflow, count }]) => {
        const net = inflow - outflow;
        const sign = net > 0 ? '+' : net < 0 ? '−' : '';

        return {
          currency,
          count,
          hasBoth: inflow > 0 && outflow > 0,
          inflowLabel: formatMoney(inflow, currency, this.locale),
          outflowLabel: formatMoney(outflow, currency, this.locale),
          netLabel: `${sign}${formatMoney(Math.abs(net), currency, this.locale)}`,
          netClass:
            net > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : net < 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-muted-foreground',
        };
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

  private readonly selectablePageIds = computed(() =>
    this.paged()
      .filter((tx) => isClassifiable(tx))
      .map((tx) => tx.id),
  );

  protected readonly pageFullySelected = computed(() => {
    const ids = this.selectablePageIds();
    const selected = this.selectedIds();
    return ids.length > 0 && ids.every((id) => selected.has(id));
  });

  constructor() {
    this.categoriesFacade.ensureLoaded();

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      this.clearSelection();
      this.transactionsFacade.loadTransactions(p.get('month') ?? undefined);
    });
  }

  onCategoryChange(tx: Transaction, categoryId: string): void {
    this.transactionsFacade.categorize(tx, this.toTransactionCategory(categoryId));
  }

  applyBulkCategory(select: HTMLSelectElement): void {
    const categoryId = select.value;
    select.value = '';

    const ids = [...this.selectedIds()];
    if (ids.length === 0 || !categoryId) return;

    this.transactionsFacade
      .categorizeMany(ids, this.toTransactionCategory(categoryId))
      .subscribe({ next: () => this.clearSelection() });
  }

  toggleSelected(tx: Transaction): void {
    this.selectedIds.update((selected) => {
      const next = new Set(selected);
      if (next.has(tx.id)) next.delete(tx.id);
      else next.add(tx.id);
      return next;
    });
  }

  togglePageSelection(): void {
    const ids = this.selectablePageIds();
    const selectAll = !this.pageFullySelected();

    this.selectedIds.update((selected) => {
      const next = new Set(selected);
      for (const id of ids) {
        if (selectAll) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  setCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
    this.pageIndex.set(0);
  }

  showPending(): void {
    this.setDirectionFilter('all');
    this.setCategoryFilter(CATEGORY_FILTER_NONE);
  }

  private toTransactionCategory(categoryId: string) {
    const category = this.categoriesFacade.byId().get(categoryId);
    return category ? { id: category.id, name: category.name, color: category.color } : null;
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
    this.categoryFilter.set(CATEGORY_FILTER_ALL);
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
