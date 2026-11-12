import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Debt, DebtDraft } from '../../../domain/entities/debt.entity';
import { DebtsRepository } from '../../../domain/repositories/debts/debts.repository';

@Injectable({ providedIn: 'root' })
export class ManageDebtsUseCase {
  private readonly debtsRepository = inject(DebtsRepository);

  create(draft: DebtDraft): Observable<Debt> {
    return this.debtsRepository.createDebt(draft);
  }

  update(id: string, draft: DebtDraft): Observable<Debt> {
    return this.debtsRepository.updateDebt(id, draft);
  }

  setArchived(id: string, archived: boolean): Observable<Debt> {
    return this.debtsRepository.setDebtArchived(id, archived);
  }

  registerPayment(id: string, amount: number): Observable<Debt> {
    return this.debtsRepository.registerPayment(id, amount);
  }
}
