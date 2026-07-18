import { inject, Injectable } from '@angular/core';
import { TransactionsRepository } from '../../../domain/repositories/transactions/transactions.repository';
import { Observable } from 'rxjs';
import { Transaction } from '../../../domain/entities/transaction.entity';

@Injectable({ providedIn: 'root' })
export class GetTransactionsUseCase {
  private readonly transactionsRepository = inject(TransactionsRepository);

  execute(month?: string): Observable<Transaction[]> {
    return this.transactionsRepository.getTransactions(month);
  }
}
