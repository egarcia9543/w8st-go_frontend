export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: Currency;
  direction: Direction;
  fundingSource: FundingSource;
  paymentMethod: PaymentMethod;
  merchant?: string;
  instrumentLast4?: string;
  channel?: string;
  counterpartyName?: string;
  counterpartyKey?: string;
  card?: TransactionCard;
  excludeFromSpending: boolean;
  transactionDate: string;
}

export interface TransactionCard {
  id: string;
  last4: string;
  kind: CardKind;
  alias?: string;
}

export enum Direction {
  OUTFLOW = 'OUTFLOW',
  INFLOW = 'INFLOW',
}

export enum FundingSource {
  OWN_FUNDS = 'OWN_FUNDS',
  CREDIT = 'CREDIT',
  INTERNAL = 'INTERNAL',
}

export enum CardKind {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  ACCOUNT = 'ACCOUNT',
}

export enum TransactionType {
  PURCHASE = 'compra',
  TRANSFER = 'transferencia',
  PAYMENT = 'pago',
  PAYROLL = 'nomina',
  SUPPLIER_PAYMENT = 'pago_proveedor',
  WITHDRAWAL = 'retiro',
  CASH_ADVANCE = 'avance',
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
