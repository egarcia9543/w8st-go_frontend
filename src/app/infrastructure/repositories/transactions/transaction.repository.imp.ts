import { inject, Injectable } from '@angular/core';
import { TransactionsRepository } from '../../../domain/repositories/transactions/transactions.repository';
import { TransactionsApiDatasource } from '../../datasources/transactions/transactions.api.datasource';
import { map, Observable } from 'rxjs';
import { TransactionMapper } from '../../mappers/transactions/transaction.mapper';
import { SyncResult } from '../../../domain/entities/sync.entity';
import { SyncMapper } from '../../mappers/sync/sync.mapper';
import { Summary } from '../../../domain/entities/summary.entity';
import { SummaryMapper } from '../../mappers/summary/summary.mapper';

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

  getSummary(): Observable<Summary[]> {
    return this.transactionsDatasource
      .getSummary()
      .pipe(map((dtos) => SummaryMapper.toDomainList(dtos)));
  }
}
