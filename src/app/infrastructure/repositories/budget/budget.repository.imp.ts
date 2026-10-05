import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { BudgetSummary, ReferenceIncome } from '../../../domain/entities/budget.entity';
import { BudgetRepository } from '../../../domain/repositories/budget/budget.repository';
import { BudgetApiDatasource } from '../../datasources/budget/budget.api.datasource';
import { BudgetMapper } from '../../mappers/budget/budget.mapper';

@Injectable()
export class BudgetRepositoryImp implements BudgetRepository {
  private readonly budgetDatasource = inject(BudgetApiDatasource);

  getSummary(month: string): Observable<BudgetSummary> {
    return this.budgetDatasource.getSummary(month).pipe(map((dto) => BudgetMapper.toDomain(dto)));
  }

  getReferenceIncomes(): Observable<ReferenceIncome[]> {
    return this.budgetDatasource.getReferenceIncomes();
  }

  saveReferenceIncome(effectiveFrom: string, amount: number): Observable<ReferenceIncome> {
    return this.budgetDatasource.saveReferenceIncome(effectiveFrom, amount);
  }

  deleteReferenceIncome(effectiveFrom: string): Observable<void> {
    return this.budgetDatasource.deleteReferenceIncome(effectiveFrom);
  }
}
