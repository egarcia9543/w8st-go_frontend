import { Currency } from './transaction.entity';

export interface MonthlyAnalytics {
  month: string;
  currency: Currency;
  outOfPocket: number;
  credit: number;
  income: number;
  internal: number;
  net: number;
  counts: AnalyticsCounts;
}

export interface AnalyticsCounts {
  outOfPocket: number;
  credit: number;
  income: number;
  internal: number;
}
