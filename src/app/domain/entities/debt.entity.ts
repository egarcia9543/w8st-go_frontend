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

export const ANNUAL_RATE_MAX = 100;

export interface Debt {
  id: string;
  name: string;
  kind: DebtKind;
  balance: number;
  annualRate: number;
  monthlyPayment: number;
  paidByOther: boolean;
  notes?: string;
  archived: boolean;
  updatedAt: string;
}

export interface DebtDraft {
  name: string;
  kind: DebtKind;
  balance: number;
  annualRate: number;
  monthlyPayment: number;
  paidByOther: boolean;
  notes: string | null;
}

export interface DebtPayoff {
  id: string;
  name: string;
  order: number;
  annualRate: number;
  balance: number;
  payoffMonth?: string;
  months?: number;
  interestPaid: number;
}

export interface DebtPlan {
  startMonth: string;
  extraPerMonth: number;
  monthlyPayment: number;
  totalBalance: number;
  totalInterest: number;
  debtFreeMonth?: string;
  debts: DebtPayoff[];
  paidByOther: DebtPayoff[];
}
