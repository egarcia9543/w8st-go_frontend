export enum DebtKind {
  CREDIT_CARD = 'CREDIT_CARD',
  LOAN = 'LOAN',
  OTHER = 'OTHER',
}

export const DEBT_KIND_LABELS: Record<DebtKind, string> = {
  [DebtKind.CREDIT_CARD]: 'Tarjeta de crédito',
  [DebtKind.LOAN]: 'Crédito',
  [DebtKind.OTHER]: 'Otra',
};

export enum DebtStrategy {
  CARDS_FIRST = 'CARDS_FIRST',
  AVALANCHE = 'AVALANCHE',
}

export const DEBT_STRATEGY_LABELS: Record<DebtStrategy, string> = {
  [DebtStrategy.CARDS_FIRST]: 'Tarjetas primero',
  [DebtStrategy.AVALANCHE]: 'Avalancha',
};

export const ANNUAL_RATE_MAX = 100;
export const DUE_DAY_MIN = 1;
export const DUE_DAY_MAX = 31;

export interface DebtPayment {
  amount: number;
  paidAt: string;
}

export interface Debt {
  id: string;
  name: string;
  kind: DebtKind;
  balance: number;
  annualRate: number;
  monthlyPayment: number;
  dueDay?: number;
  paidByOther: boolean;
  notes?: string;
  archived: boolean;
  updatedAt: string;
  recentPayments: DebtPayment[];
}

export interface DebtDraft {
  name: string;
  kind: DebtKind;
  balance: number;
  annualRate: number;
  monthlyPayment: number;
  dueDay: number | null;
  paidByOther: boolean;
  notes: string | null;
}

export interface DebtPayoff {
  id: string;
  name: string;
  order: number;
  annualRate: number;
  balance: number;
  receivesExtra: boolean;
  payoffMonth?: string;
  months?: number;
  interestPaid: number;
}

export interface DebtPlan {
  strategy: DebtStrategy;
  startMonth: string;
  extraPerMonth: number;
  monthlyPayment: number;
  totalBalance: number;
  totalInterest: number;
  debtFreeMonth?: string;
  debts: DebtPayoff[];
  paidByOther: DebtPayoff[];
}
