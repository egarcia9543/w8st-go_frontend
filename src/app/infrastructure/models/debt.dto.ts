export interface DebtDto {
  id: string;
  name: string;
  kind: string;
  balance: number;
  annualRate: number;
  monthlyPayment: number;
  dueDay: number | null;
  paidByOther: boolean;
  notes: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  recentPayments: DebtPaymentDto[];
}

export interface SaveDebtDto {
  name?: string;
  kind?: string;
  balance?: number;
  annualRate?: number;
  monthlyPayment?: number;
  dueDay?: number | null;
  paidByOther?: boolean;
  notes?: string | null;
  archived?: boolean;
}

export interface DebtPaymentDto {
  amount: number;
  paidAt: string;
}

export interface RegisterPaymentDto {
  amount: number;
  paidAt?: string;
}

export interface DebtPayoffDto {
  id: string;
  name: string;
  order: number;
  annualRate: number;
  balance: number;
  receivesExtra: boolean;
  payoffMonth: string | null;
  months: number | null;
  interestPaid: number;
}

export interface DebtPlanDto {
  strategy: string;
  startMonth: string;
  extraPerMonth: number;
  monthlyPayment: number;
  totalBalance: number;
  totalInterest: number;
  debtFreeMonth: string | null;
  debts: DebtPayoffDto[];
  paidByOther: DebtPayoffDto[];
}
