export interface CardDto {
  id: string;
  last4: string;
  kind: string;
  alias: string | null;
  issuer: string | null;
  cutoffDay: number | null;
  paymentGraceDays: number | null;
  creditLimit: number | null;
  archived: boolean;
  transactionCount: number;
  currentCycle: BillingCycleDto | null;
}

export interface BillingCycleDto {
  label: string;
  from: string;
  to: string;
  closesOn: string | null;
  paymentDueDate: string | null;
}

export interface UpdateCardDto {
  alias?: string | null;
  issuer?: string | null;
  cutoffDay?: number | null;
  paymentGraceDays?: number | null;
  creditLimit?: number | null;
  archived?: boolean;
}
