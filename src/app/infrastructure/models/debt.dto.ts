export interface DebtDto {
  id: string;
  name: string;
  kind: string;
  balance: number;
  annualRate: number;
  monthlyPayment: number;
  paidByOther: boolean;
  notes: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SaveDebtDto {
  name?: string;
  kind?: string;
  balance?: number;
  annualRate?: number;
  monthlyPayment?: number;
  paidByOther?: boolean;
  notes?: string | null;
  archived?: boolean;
}

export interface DebtPaymentDto {
  amount: number;
  paidAt?: string;
}

export interface DebtPayoffDto {
  id: string;
  name: string;
  order: number;
  annualRate: number;
  balance: number;
  payoffMonth: string | null;
  months: number | null;
  interestPaid: number;
}

export interface DebtPlanDto {
  startMonth: string;
  extraPerMonth: number;
  monthlyPayment: number;
  totalBalance: number;
  totalInterest: number;
  debtFreeMonth: string | null;
  debts: DebtPayoffDto[];
  paidByOther: DebtPayoffDto[];
}
