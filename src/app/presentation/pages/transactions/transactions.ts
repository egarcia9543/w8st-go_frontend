import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { map } from 'rxjs';
import { TransactionType } from '../../../domain/entities/transaction.entity';
import { TransactionsFacade } from '../../facades/transactions.facade';

@Component({
  selector: 'app-transactions',
  imports: [CurrencyPipe, DatePipe, HlmButton],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  protected readonly transactionsFacade = inject(TransactionsFacade);
  protected readonly transactionTypes = TransactionType;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly month = toSignal(this.route.queryParamMap.pipe(map((p) => p.get('month'))), {
    initialValue: null,
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
}
