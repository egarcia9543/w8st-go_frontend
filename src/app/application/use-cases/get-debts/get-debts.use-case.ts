import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Debt } from '../../../domain/entities/debt.entity';
import { DebtsRepository } from '../../../domain/repositories/debts/debts.repository';

@Injectable({ providedIn: 'root' })
export class GetDebtsUseCase {
  private readonly debtsRepository = inject(DebtsRepository);

  execute(includeArchived = false): Observable<Debt[]> {
    return this.debtsRepository.getDebts(includeArchived);
  }
}
