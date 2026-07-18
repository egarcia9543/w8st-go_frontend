import { inject, Injectable, signal } from '@angular/core';
import { GetTransactionsUseCase } from '../../application/use-cases/get-transactions/get-transactions.use-case';
import { Transaction } from '../../domain/entities/transaction.entity';

export interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class TransactionsFacade {
  private readonly getTransactionsUseCase = inject(GetTransactionsUseCase);

  private readonly initialState: TransactionsState = {
    transactions: [],
    loading: false,
    error: false,
  };

  private readonly _transactionsState = signal({ ...this.initialState });
  readonly transactionsState = this._transactionsState.asReadonly();

  loadTransactions(): void {
    this._transactionsState.update((state) => ({
      ...state,
      loading: true,
      error: false,
    }));

    this.getTransactionsUseCase.execute().subscribe({
      next: (transactions) => {
        this._transactionsState.update((state) => ({
          ...state,
          transactions,
          loading: false,
          error: false,
        }));
      },
      error: () => {
        this._transactionsState.update((state) => ({
          ...state,
          loading: false,
          error: true,
        }));
      },
    });
  }
}
