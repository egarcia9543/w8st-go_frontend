import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DebtPlan, DebtStrategy } from '../../../domain/entities/debt.entity';
import { DebtsRepository } from '../../../domain/repositories/debts/debts.repository';

@Injectable({ providedIn: 'root' })
export class GetDebtPlanUseCase {
  private readonly debtsRepository = inject(DebtsRepository);

  execute(extraPerMonth: number, strategy: DebtStrategy): Observable<DebtPlan> {
    return this.debtsRepository.getPlan(extraPerMonth, strategy);
  }
}
