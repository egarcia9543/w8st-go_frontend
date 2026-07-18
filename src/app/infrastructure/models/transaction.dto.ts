export interface TransactionDto {
  id: string;
  gmailMessageId: string;
  type: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  merchant: string | null;
  cardLast4: string | null;
  channel: string | null;
  recipientName: string | null;
  recipientKey: string | null;
  transactionDate: string;
  createdAt: string;
}
