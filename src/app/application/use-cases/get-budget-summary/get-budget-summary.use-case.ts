import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BudgetSummary } from '../../../domain/entities/budget.entity';
import { BudgetRepository } from '../../../domain/repositories/budget/budget.repository';

@Injectable({ providedIn: 'root' })
export class GetBudgetSummaryUseCase {
  private readonly budgetRepository = inject(BudgetRepository);

  execute(month: string): Observable<BudgetSummary> {
    return this.budgetRepository.getSummary(month);
  }
}
