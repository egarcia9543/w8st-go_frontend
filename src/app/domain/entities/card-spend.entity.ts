import { CardKind, Currency } from './transaction.entity';

export interface CardSpend {
  cardId: string;
  last4: string;
  kind: CardKind;
  alias?: string;
  currency: Currency;
  total: number;
  count: number;
  topMerchants: MerchantSpend[];
}

export interface MerchantSpend {
  merchant: string;
  total: number;
}
