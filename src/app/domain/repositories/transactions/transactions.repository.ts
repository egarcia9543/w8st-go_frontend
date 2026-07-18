import { Observable, ObservedValueOf } from 'rxjs';
import { Transaction } from '../../entities/transaction.entity';
import { SyncResult } from '../../entities/sync.entity';
import { Summary } from '../../entities/summary.entity';

export abstract class TransactionsRepository {
  abstract getTransactions(month?: string): Observable<Transaction[]>;
  abstract syncTransactions(): Observable<SyncResult>;
  abstract getSummary(): Observable<Summary[]>;
}
