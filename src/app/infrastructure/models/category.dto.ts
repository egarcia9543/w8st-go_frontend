export interface CategoryDto {
  id: string;
  name: string;
  color: string;
  groupId: string | null;
  monthlyLimit: number | null;
  archived: boolean;
  position: number;
}

export interface BudgetGroupDto {
  id: string;
  name: string;
  kind: string;
  targetPercent: number;
  color: string;
  position: number;
  categories: CategoryDto[];
}

export interface CategoryCatalogDto {
  groups: BudgetGroupDto[];
  ungrouped: CategoryDto[];
}
