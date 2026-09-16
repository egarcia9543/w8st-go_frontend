import { CardKind, Currency } from './transaction.entity';

export enum SpendBasis {
  CYCLE = 'cycle',
  CALENDAR = 'calendar',
}

export interface CardSpend {
  cardId: string;
  last4: string;
  kind: CardKind;
  alias?: string;
  cutoffDay?: number;
  paymentGraceDays?: number;
  creditLimit?: number;
  currency: Currency;
  total: number;
  count: number;
  utilization?: number;
  period?: SpendPeriod;
  topMerchants: MerchantSpend[];
}

export interface SpendPeriod {
  basis: SpendBasis;
  label: string;
  from: string;
  to: string;
  closesOn?: string;
  paymentDueDate?: string;
}

export interface MerchantSpend {
  merchant: string;
  total: number;
}
