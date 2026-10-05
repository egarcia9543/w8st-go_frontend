import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReferenceIncome } from '../../../domain/entities/budget.entity';
import { BudgetRepository } from '../../../domain/repositories/budget/budget.repository';

@Injectable({ providedIn: 'root' })
export class ManageReferenceIncomeUseCase {
  private readonly budgetRepository = inject(BudgetRepository);

  list(): Observable<ReferenceIncome[]> {
    return this.budgetRepository.getReferenceIncomes();
  }

  save(effectiveFrom: string, amount: number): Observable<ReferenceIncome> {
    return this.budgetRepository.saveReferenceIncome(effectiveFrom, amount);
  }

  remove(effectiveFrom: string): Observable<void> {
    return this.budgetRepository.deleteReferenceIncome(effectiveFrom);
  }
}
