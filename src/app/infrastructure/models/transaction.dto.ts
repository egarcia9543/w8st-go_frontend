export interface TransactionDto {
  id: string;
  gmailMessageId: string;
  type: string;
  amount: number;
  currency: string;
  direction: string;
  fundingSource: string;
  paymentMethod: string;
  merchant: string | null;
  instrumentLast4: string | null;
  channel: string | null;
  counterpartyName: string | null;
  counterpartyKey: string | null;
  card: TransactionCardDto | null;
  excludeFromSpending: boolean;
  transactionDate: string;
  createdAt: string;
}

export interface TransactionCardDto {
  id: string;
  last4: string;
  kind: string;
  alias: string | null;
}
