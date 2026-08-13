import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { Direction, FundingSource, Transaction } from '../../domain/entities/transaction.entity';

@Pipe({ name: 'signedAmount' })
export class SignedAmountPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(tx: Transaction): string {
    const formatted = new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: tx.currency,
      currencyDisplay: 'symbol',
      maximumFractionDigits: 0,
    }).format(tx.amount);

    if (tx.fundingSource === FundingSource.INTERNAL || tx.excludeFromSpending) {
      return formatted;
    }

    return `${tx.direction === Direction.INFLOW ? '+' : '−'}${formatted}`;
  }
}
