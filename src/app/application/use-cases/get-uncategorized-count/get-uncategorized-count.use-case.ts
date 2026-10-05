import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TransactionsRepository } from '../../../domain/repositories/transactions/transactions.repository';

@Injectable({ providedIn: 'root' })
export class GetUncategorizedCountUseCase {
  private readonly transactionsRepository = inject(TransactionsRepository);

  execute(month?: string): Observable<number> {
    return this.transactionsRepository.getUncategorizedCount(month);
  }
}
