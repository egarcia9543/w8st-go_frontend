import { CardKind } from './transaction.entity';

export interface Card {
  id: string;
  last4: string;
  kind: CardKind;
  alias?: string;
  issuer?: string;
  cutoffDay?: number;
  paymentGraceDays?: number;
  creditLimit?: number;
  archived: boolean;
  transactionCount: number;
  currentCycle?: BillingCycle;
}

export interface BillingCycle {
  label: string;
  from: string;
  to: string;
  closesOn?: string;
  paymentDueDate?: string;
}

export interface CardSettings {
  alias: string | null;
  issuer: string | null;
  cutoffDay: number | null;
  paymentGraceDays: number | null;
  creditLimit: number | null;
}

export const CUTOFF_DAY_MIN = 1;
export const CUTOFF_DAY_MAX = 31;
export const GRACE_DAYS_MIN = 0;
export const GRACE_DAYS_MAX = 60;
