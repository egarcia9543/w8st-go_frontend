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
