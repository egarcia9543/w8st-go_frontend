import { inject, Injectable } from '@angular/core';
import { TransactionsRepository } from '../../../domain/repositories/transactions/transactions.repository';
import { TransactionsApiDatasource } from '../../datasources/transactions/transactions.api.datasource';
import { map, Observable } from 'rxjs';
import { TransactionMapper } from '../../mappers/transactions/transaction.mapper';
import { SyncResult } from '../../../domain/entities/sync.entity';
import { SyncMapper } from '../../mappers/sync/sync.mapper';
import { Transaction } from '../../../domain/entities/transaction.entity';

@Injectable()
export class TransactionRepositoryImp implements TransactionsRepository {
  private readonly transactionsDatasource = inject(TransactionsApiDatasource);

  getTransactions(month?: string) {
    return this.transactionsDatasource
      .getTransactions(month)
      .pipe(map((dtos) => TransactionMapper.toDomainList(dtos)));
  }

  syncTransactions(): Observable<SyncResult> {
    return this.transactionsDatasource
      .syncTransactions()
      .pipe(map((dto) => SyncMapper.toDomain(dto)));
  }

  categorize(id: string, categoryId: string | null): Observable<Transaction> {
    return this.transactionsDatasource
      .categorize(id, categoryId)
      .pipe(map((dto) => TransactionMapper.toDomain(dto)));
  }

  categorizeMany(ids: string[], categoryId: string | null): Observable<number> {
    return this.transactionsDatasource
      .categorizeMany({ ids, categoryId })
      .pipe(map((dto) => dto.updated));
  }

  getUncategorizedCount(month?: string): Observable<number> {
    return this.transactionsDatasource
      .getUncategorizedCount(month)
      .pipe(map((dto) => dto.count));
  }
}
