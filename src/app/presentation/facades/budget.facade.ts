import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { GetBudgetSummaryUseCase } from '../../application/use-cases/get-budget-summary/get-budget-summary.use-case';
import { ManageReferenceIncomeUseCase } from '../../application/use-cases/manage-reference-income/manage-reference-income.use-case';
import { BudgetSummary, ReferenceIncome } from '../../domain/entities/budget.entity';
import { currentBogotaMonth } from '../utils/month';

export interface BudgetState {
  summary: BudgetSummary | null;
  loading: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class BudgetFacade {
  private readonly getSummaryUseCase = inject(GetBudgetSummaryUseCase);
  private readonly referenceIncomeUseCase = inject(ManageReferenceIncomeUseCase);

  private readonly _month = signal(currentBogotaMonth());
  readonly month = this._month.asReadonly();

  private readonly _state = signal<BudgetState>({ summary: null, loading: false, error: false });
  readonly state = this._state.asReadonly();

  private readonly _incomes = signal<ReferenceIncome[]>([]);
  readonly incomes = this._incomes.asReadonly();

  private readonly _savingIncome = signal(false);
  readonly savingIncome = this._savingIncome.asReadonly();

  loadSummary(month: string = this._month()): void {
    this._month.set(month);
    this._state.update((state) => ({ ...state, loading: true, error: false }));

    this.getSummaryUseCase.execute(month).subscribe({
      next: (summary) => {
        if (this._month() !== month) return;
        this._state.set({ summary, loading: false, error: false });
      },
      error: () => this._state.set({ summary: null, loading: false, error: true }),
    });
  }

  loadIncomes(): void {
    this.referenceIncomeUseCase.list().subscribe({
      next: (incomes) => this._incomes.set(incomes),
      error: () => this._incomes.set([]),
    });
  }

  saveIncome(effectiveFrom: string, amount: number): Observable<ReferenceIncome> {
    return this.trackIncome(this.referenceIncomeUseCase.save(effectiveFrom, amount));
  }

  deleteIncome(effectiveFrom: string): Observable<void> {
    return this.trackIncome(this.referenceIncomeUseCase.remove(effectiveFrom));
  }

  private trackIncome<T>(request: Observable<T>): Observable<T> {
    this._savingIncome.set(true);
    return request.pipe(
      tap(() => {
        this.loadIncomes();
        this.loadSummary();
      }),
      finalize(() => this._savingIncome.set(false)),
    );
  }
}
