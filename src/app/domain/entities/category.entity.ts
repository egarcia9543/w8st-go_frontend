export enum BudgetGroupKind {
  SPENDING = 'SPENDING',
  SAVINGS = 'SAVINGS',
}

export interface Category {
  id: string;
  name: string;
  color: string;
  groupId?: string;
  monthlyLimit?: number;
  archived: boolean;
  position: number;
}

export interface BudgetGroup {
  id: string;
  name: string;
  kind: BudgetGroupKind;
  targetPercent: number;
  color: string;
  position: number;
  categories: Category[];
}

export interface CategoryCatalog {
  groups: BudgetGroup[];
  ungrouped: Category[];
}

export interface CategoryDraft {
  name: string;
  color: string;
  groupId: string | null;
  monthlyLimit: number | null;
}

export interface BudgetGroupDraft {
  name: string;
  kind: BudgetGroupKind;
  targetPercent: number;
  color: string;
}

export const BUDGET_COLORS = [
  '#2563eb',
  '#0891b2',
  '#16a34a',
  '#059669',
  '#ca8a04',
  '#ea580c',
  '#dc2626',
  '#db2777',
  '#9333ea',
  '#7c3aed',
  '#475569',
  '#78716c',
] as const;
