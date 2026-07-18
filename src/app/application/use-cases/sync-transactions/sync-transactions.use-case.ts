import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SyncResult } from '../../../domain/entities/sync.entity';
import { TransactionsRepository } from '../../../domain/repositories/transactions/transactions.repository';

@Injectable({ providedIn: 'root' })
export class SyncTransactionsUseCase {
  private readonly transactionsRepository = inject(TransactionsRepository);

  execute(): Observable<SyncResult> {
    return this.transactionsRepository.syncTransactions();
  }
}
