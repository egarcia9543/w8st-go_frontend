import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionsRepository } from '../../../domain/repositories/transactions/transactions.repository';

@Injectable({ providedIn: 'root' })
export class CategorizeTransactionsUseCase {
  private readonly transactionsRepository = inject(TransactionsRepository);

  execute(id: string, categoryId: string | null): Observable<Transaction> {
    return this.transactionsRepository.categorize(id, categoryId);
  }

  executeMany(ids: string[], categoryId: string | null): Observable<number> {
    return this.transactionsRepository.categorizeMany(ids, categoryId);
  }
}
