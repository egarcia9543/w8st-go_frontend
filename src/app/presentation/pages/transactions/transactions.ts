import { CurrencyPipe, DatePipe } from '@angular/common';
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
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../../../domain/entities/transaction.entity';
import { TransactionsFacade } from '../../facades/transactions.facade';

type TypeFilter = 'all' | TransactionType;

@Component({
  selector: 'app-transactions',
  imports: [
    CurrencyPipe,
    DatePipe,
    HlmButton,
    HlmTableImports,
    HlmSkeletonImports,
    HlmMonthYearCalendar,
    NgIcon,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
  providers: [provideIcons({ lucideCalendar })],
})
export class Transactions {
  protected readonly transactionsFacade = inject(TransactionsFacade);
  protected readonly transactionTypes = TransactionType;
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
  protected readonly typeFilter = signal<TypeFilter>('all');

  private readonly allTx = computed(() => this.transactionsFacade.transactionsState().transactions);

  protected readonly counts = computed(() => {
    const tx = this.allTx();
    return {
      all: tx.length,
      [TransactionType.PURCHASE]: tx.filter((t) => t.type === TransactionType.PURCHASE).length,
      [TransactionType.TRANSFER]: tx.filter((t) => t.type === TransactionType.TRANSFER).length,
    };
  });

  protected readonly filtered = computed(() => {
    const f = this.typeFilter();
    const tx = this.allTx();
    return f === 'all' ? tx : tx.filter((t) => t.type === f);
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

  setTypeFilter(filter: TypeFilter): void {
    this.typeFilter.set(filter);
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
    return type === TransactionType.PURCHASE ? 'Compra' : 'Transferencia';
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
    return tx.merchant ?? tx.recipientName ?? '—';
  }
}
