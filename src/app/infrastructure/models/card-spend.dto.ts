export interface CardSpendDto {
  cardId: string;
  last4: string;
  kind: string;
  alias: string | null;
  cutoffDay: number | null;
  paymentGraceDays: number | null;
  creditLimit: number | null;
  currency: string;
  total: number;
  count: number;
  utilization: number | null;
  period: SpendPeriodDto | null;
  topMerchants: MerchantSpendDto[];
}

export interface SpendPeriodDto {
  basis: string;
  label: string;
  from: string;
  to: string;
  closesOn: string | null;
  paymentDueDate: string | null;
}

export interface MerchantSpendDto {
  merchant: string;
  total: number;
}
