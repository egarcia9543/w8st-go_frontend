import { Observable } from 'rxjs';
import { Debt, DebtDraft, DebtPlan, DebtStrategy } from '../../entities/debt.entity';

export abstract class DebtsRepository {
  abstract getDebts(includeArchived?: boolean): Observable<Debt[]>;
  abstract createDebt(draft: DebtDraft): Observable<Debt>;
  abstract updateDebt(id: string, draft: Partial<DebtDraft>): Observable<Debt>;
  abstract setDebtArchived(id: string, archived: boolean): Observable<Debt>;
  abstract registerPayment(id: string, amount: number): Observable<Debt>;
  abstract getPlan(extraPerMonth: number, strategy: DebtStrategy): Observable<DebtPlan>;
}
