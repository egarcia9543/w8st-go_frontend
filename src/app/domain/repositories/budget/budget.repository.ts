import { Observable } from 'rxjs';
import { BudgetSummary, ReferenceIncome } from '../../entities/budget.entity';

export abstract class BudgetRepository {
  abstract getSummary(month: string): Observable<BudgetSummary>;
  abstract getReferenceIncomes(): Observable<ReferenceIncome[]>;
  abstract saveReferenceIncome(effectiveFrom: string, amount: number): Observable<ReferenceIncome>;
  abstract deleteReferenceIncome(effectiveFrom: string): Observable<void>;
}
