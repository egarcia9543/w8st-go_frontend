import { Observable } from 'rxjs';
import { Transaction } from '../../entities/transaction.entity';

export abstract class TransactionsRepository {
  abstract getTransactions(): Observable<Transaction[]>;
}
