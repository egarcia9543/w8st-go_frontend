export interface CardSpendDto {
  cardId: string;
  last4: string;
  kind: string;
  alias: string | null;
  cutoffDay: number | null;
  currency: string;
  total: number;
  count: number;
  topMerchants: MerchantSpendDto[];
}

export interface MerchantSpendDto {
  merchant: string;
  total: number;
}
