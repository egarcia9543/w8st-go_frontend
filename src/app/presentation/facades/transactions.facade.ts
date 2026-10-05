import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { GetTransactionsUseCase } from '../../application/use-cases/get-transactions/get-transactions.use-case';
import { Transaction, TransactionCategory } from '../../domain/entities/transaction.entity';
import { SyncTransactionsUseCase } from '../../application/use-cases/sync-transactions/sync-transactions.use-case';
import { SyncResult } from '../../domain/entities/sync.entity';
import { CategorizeTransactionsUseCase } from '../../application/use-cases/categorize-transactions/categorize-transactions.use-case';
import { GetUncategorizedCountUseCase } from '../../application/use-cases/get-uncategorized-count/get-uncategorized-count.use-case';
import { currentBogotaMonth } from '../utils/month';

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
  private readonly categorizeUseCase = inject(CategorizeTransactionsUseCase);
  private readonly getUncategorizedCountUseCase = inject(GetUncategorizedCountUseCase);

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

  private readonly _uncategorizedCount = signal(0);
  readonly uncategorizedCount = this._uncategorizedCount.asReadonly();

  private readonly _categorizing = signal(false);
  readonly categorizing = this._categorizing.asReadonly();

  private readonly _categorizeError = signal<string | null>(null);
  readonly categorizeError = this._categorizeError.asReadonly();

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
        this.loadUncategorizedCount();
      },
      error: () => this._syncState.set({ syncing: false, result: null, error: true }),
    });
  }

  loadUncategorizedCount(): void {
    this.getUncategorizedCountUseCase.execute(currentBogotaMonth()).subscribe({
      next: (count) => this._uncategorizedCount.set(count),
      error: () => this._uncategorizedCount.set(0),
    });
  }

  categorize(tx: Transaction, category: TransactionCategory | null): void {
    const previous = tx.category;

    this._categorizeError.set(null);
    this.setCategory([tx.id], category ?? undefined);

    this.categorizeUseCase.execute(tx.id, category?.id ?? null).subscribe({
      next: () => this.loadUncategorizedCount(),
      error: () => {
        this.setCategory([tx.id], previous);
        this._categorizeError.set('No se pudo clasificar la transacción. Intenta de nuevo.');
      },
    });
  }

  categorizeMany(ids: string[], category: TransactionCategory | null): Observable<number> {
    this._categorizeError.set(null);
    this._categorizing.set(true);

    return this.categorizeUseCase.executeMany(ids, category?.id ?? null).pipe(
      tap({
        next: () => {
          this.setCategory(ids, category ?? undefined);
          this.loadUncategorizedCount();
        },
        error: () => this._categorizeError.set('No se pudieron clasificar las transacciones.'),
      }),
      finalize(() => this._categorizing.set(false)),
    );
  }

  private setCategory(ids: string[], category: TransactionCategory | undefined): void {
    const targets = new Set(ids);

    this._transactionsState.update((state) => ({
      ...state,
      transactions: state.transactions.map((tx) =>
        targets.has(tx.id) ? { ...tx, category } : tx,
      ),
    }));
  }
}
