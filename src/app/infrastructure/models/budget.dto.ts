export interface ReferenceIncomeDto {
  amount: number;
  effectiveFrom: string;
}

export interface CategorySummaryDto {
  id: string;
  name: string;
  color: string;
  limit: number | null;
  spent: number;
  count: number;
  percentOfIncome: number | null;
  status: string;
}

export interface GroupSummaryDto {
  id: string;
  name: string;
  kind: string;
  targetPercent: number;
  color: string;
  limit: number | null;
  spent: number;
  percentOfIncome: number | null;
  status: string;
  categories: CategorySummaryDto[];
}

export interface BudgetSummaryDto {
  month: string;
  monthProgress: number;
  referenceIncome: ReferenceIncomeDto | null;
  totalSpent: number;
  totalSaved: number;
  unassigned: number | null;
  groups: GroupSummaryDto[];
  ungrouped: CategorySummaryDto[];
  uncategorized: { spent: number; count: number; percentOfIncome: number | null };
  foreign: { currency: string; total: number; count: number }[];
}
