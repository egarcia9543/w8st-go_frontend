import { inject, Injectable, signal } from '@angular/core';
import { GetTransactionsUseCase } from '../../application/use-cases/get-transactions/get-transactions.use-case';
import { Transaction } from '../../domain/entities/transaction.entity';
import { SyncTransactionsUseCase } from '../../application/use-cases/sync-transactions/sync-transactions.use-case';
import { SyncResult } from '../../domain/entities/sync.entity';

export interface TransactionsState {
  transactions: Transaction[];
  loading: boolean;
  error: boolean;
}

export interface SyncState {
  syncing: boolean;
  result: SyncResult | null;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class TransactionsFacade {
  private readonly getTransactionsUseCase = inject(GetTransactionsUseCase);
  private readonly syncUseCase = inject(SyncTransactionsUseCase);

  private readonly initialState: TransactionsState = {
    transactions: [],
    loading: false,
    error: false,
  };

  private readonly syncInitialState: SyncState = {
    syncing: false,
    result: null,
    error: false,
  };

  private readonly _transactionsState = signal({ ...this.initialState });
  readonly transactionsState = this._transactionsState.asReadonly();

  private readonly _syncState = signal({ ...this.syncInitialState });
  readonly syncState = this._syncState.asReadonly();

  loadTransactions(month?: string): void {
    this._transactionsState.set({ error: false, loading: true, transactions: [] });

    this.getTransactionsUseCase.execute(month).subscribe({
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

  syncTransactions(month?: string): void {
    this._syncState.set({ syncing: true, result: null, error: false });

    this.syncUseCase.execute().subscribe({
      next: (result) => {
        this._syncState.set({
          syncing: false,
          result,
          error: false,
        });
        this.loadTransactions(month);
      },
      error: () => this._syncState.set({ syncing: false, result: null, error: true }),
    });
  }
}
