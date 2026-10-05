import { BudgetGroupKind } from './category.entity';

export enum BudgetStatus {
  OK = 'OK',
  AT_RISK = 'AT_RISK',
  OVER = 'OVER',
  REACHED = 'REACHED',
  PENDING = 'PENDING',
  NO_LIMIT = 'NO_LIMIT',
}

export interface ReferenceIncome {
  amount: number;
  effectiveFrom: string;
}

export interface CategorySummary {
  id: string;
  name: string;
  color: string;
  limit?: number;
  spent: number;
  count: number;
  percentOfIncome?: number;
  status: BudgetStatus;
}

export interface GroupSummary {
  id: string;
  name: string;
  kind: BudgetGroupKind;
  targetPercent: number;
  color: string;
  limit?: number;
  spent: number;
  percentOfIncome?: number;
  status: BudgetStatus;
  categories: CategorySummary[];
}

export interface ForeignSpend {
  currency: string;
  total: number;
  count: number;
}

export interface BudgetSummary {
  month: string;
  monthProgress: number;
  referenceIncome?: ReferenceIncome;
  totalSpent: number;
  totalSaved: number;
  unassigned?: number;
  groups: GroupSummary[];
  ungrouped: CategorySummary[];
  uncategorized: { spent: number; count: number; percentOfIncome?: number };
  foreign: ForeignSpend[];
}
