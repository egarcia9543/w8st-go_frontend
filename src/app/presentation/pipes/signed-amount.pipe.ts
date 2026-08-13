import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { Direction, FundingSource, Transaction } from '../../domain/entities/transaction.entity';
import { formatMoney } from './format-money';

@Pipe({ name: 'signedAmount' })
export class SignedAmountPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(tx: Transaction): string {
    const formatted = formatMoney(tx.amount, tx.currency, this.locale);

    if (tx.fundingSource === FundingSource.INTERNAL || tx.excludeFromSpending) {
      return formatted;
    }

    return `${tx.direction === Direction.INFLOW ? '+' : '−'}${formatted}`;
  }
}
