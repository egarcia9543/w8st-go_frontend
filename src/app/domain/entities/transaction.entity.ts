export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  paymentMethod: PaymentMethod;
  merchant?: string;
  cardLast4?: string;
  channel?: string;
  recipientName?: string;
  recipientKey?: string;
  transactionDate: string;
}

export enum TransactionType {
  TRANSFER = 'transferencia',
  PURCHASE = 'compra',
}

export enum PaymentMethod {
  ACCOUNT = 'cuenta',
  DEBIT_CARD = 'tarjeta_debito',
  CREDIT_CARD = 'tarjeta_credito',
}

export enum Currency {
  USD = 'USD',
  COP = 'COP',
}
