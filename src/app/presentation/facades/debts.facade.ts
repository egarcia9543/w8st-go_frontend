import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { GetDebtPlanUseCase } from '../../application/use-cases/get-debt-plan/get-debt-plan.use-case';
import { GetDebtsUseCase } from '../../application/use-cases/get-debts/get-debts.use-case';
import { ManageDebtsUseCase } from '../../application/use-cases/manage-debts/manage-debts.use-case';
import { Debt, DebtDraft, DebtPlan } from '../../domain/entities/debt.entity';

export interface DebtsState {
  debts: Debt[];
  loading: boolean;
  error: boolean;
}

export interface DebtPlanState {
  plan: DebtPlan | null;
  loading: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class DebtsFacade {
  private readonly getDebtsUseCase = inject(GetDebtsUseCase);
  private readonly manageDebtsUseCase = inject(ManageDebtsUseCase);
  private readonly getDebtPlanUseCase = inject(GetDebtPlanUseCase);

  private readonly _state = signal<DebtsState>({ debts: [], loading: false, error: false });
  readonly state = this._state.asReadonly();

  private readonly _planState = signal<DebtPlanState>({ plan: null, loading: false, error: false });
  readonly planState = this._planState.asReadonly();

  private readonly _extraPerMonth = signal(0);
  readonly extraPerMonth = this._extraPerMonth.asReadonly();

  private readonly _savingDebtId = signal<string | null>(null);
  readonly savingDebtId = this._savingDebtId.asReadonly();

  readonly activeDebts = computed(() => this._state().debts.filter((debt) => !debt.archived));
  readonly archivedDebts = computed(() => this._state().debts.filter((debt) => debt.archived));

  loadDebts(): void {
    this._state.update((state) => ({ ...state, loading: true, error: false }));

    this.getDebtsUseCase.execute(true).subscribe({
      next: (debts) => this._state.set({ debts, loading: false, error: false }),
      error: () => this._state.set({ debts: [], loading: false, error: true }),
    });
  }

  loadPlan(extraPerMonth: number = this._extraPerMonth()): void {
    this._extraPerMonth.set(extraPerMonth);
    this._planState.update((state) => ({ ...state, loading: true, error: false }));

    this.getDebtPlanUseCase.execute(extraPerMonth).subscribe({
      next: (plan) => {
        if (this._extraPerMonth() !== extraPerMonth) return;
        this._planState.set({ plan, loading: false, error: false });
      },
      error: () => this._planState.set({ plan: null, loading: false, error: true }),
    });
  }

  createDebt(draft: DebtDraft): Observable<Debt> {
    return this.track('new', this.manageDebtsUseCase.create(draft));
  }

  updateDebt(id: string, draft: DebtDraft): Observable<Debt> {
    return this.track(id, this.manageDebtsUseCase.update(id, draft));
  }

  setArchived(id: string, archived: boolean): Observable<Debt> {
    return this.track(id, this.manageDebtsUseCase.setArchived(id, archived));
  }

  registerPayment(id: string, amount: number): Observable<Debt> {
    return this.track(id, this.manageDebtsUseCase.registerPayment(id, amount));
  }

  // Cualquier cambio en una deuda mueve el plan: se recargan ambos.
  private track(id: string, request: Observable<Debt>): Observable<Debt> {
    this._savingDebtId.set(id);

    return request.pipe(
      tap(() => {
        this.loadDebts();
        this.loadPlan();
      }),
      finalize(() => this._savingDebtId.set(null)),
    );
  }
}
