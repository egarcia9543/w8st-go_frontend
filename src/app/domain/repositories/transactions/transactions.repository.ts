import { Observable } from 'rxjs';
import { Transaction } from '../../entities/transaction.entity';
import { SyncResult } from '../../entities/sync.entity';

export abstract class TransactionsRepository {
  abstract getTransactions(month?: string): Observable<Transaction[]>;
  abstract syncTransactions(): Observable<SyncResult>;
}
