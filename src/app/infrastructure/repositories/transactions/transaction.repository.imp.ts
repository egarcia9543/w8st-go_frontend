import { inject, Injectable } from '@angular/core';
import { TransactionsRepository } from '../../../domain/repositories/transactions/transactions.repository';
import { TransactionsApiDatasource } from '../../datasources/transactions/transactions.api.datasource';
import { map } from 'rxjs';
import { TransactionMapper } from '../../mappers/transactions/transaction.mapper';

@Injectable()
export class TransactionRepositoryImp implements TransactionsRepository {
  private readonly transactionsDatasource = inject(TransactionsApiDatasource);

  getTransactions(month?: string) {
    return this.transactionsDatasource
      .getTransactions(month)
      .pipe(map((dtos) => TransactionMapper.toDomainList(dtos)));
  }
}
