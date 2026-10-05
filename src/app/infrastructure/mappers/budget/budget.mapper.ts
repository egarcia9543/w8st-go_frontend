import {
  BudgetStatus,
  BudgetSummary,
  CategorySummary,
  GroupSummary,
} from '../../../domain/entities/budget.entity';
import { BudgetGroupKind } from '../../../domain/entities/category.entity';
import { BudgetSummaryDto, CategorySummaryDto, GroupSummaryDto } from '../../models/budget.dto';

export class BudgetMapper {
  static toDomain(dto: BudgetSummaryDto): BudgetSummary {
    return {
      month: dto.month,
      monthProgress: dto.monthProgress,
      referenceIncome: dto.referenceIncome ?? undefined,
      totalSpent: dto.totalSpent,
      totalSaved: dto.totalSaved,
      unassigned: dto.unassigned ?? undefined,
      groups: dto.groups.map((group) => this.groupToDomain(group)),
      ungrouped: dto.ungrouped.map((category) => this.categoryToDomain(category)),
      uncategorized: {
        spent: dto.uncategorized.spent,
        count: dto.uncategorized.count,
        percentOfIncome: dto.uncategorized.percentOfIncome ?? undefined,
      },
      foreign: dto.foreign,
    };
  }

  private static groupToDomain(dto: GroupSummaryDto): GroupSummary {
    return {
      id: dto.id,
      name: dto.name,
      kind: dto.kind as BudgetGroupKind,
      targetPercent: dto.targetPercent,
      color: dto.color,
      limit: dto.limit ?? undefined,
      spent: dto.spent,
      percentOfIncome: dto.percentOfIncome ?? undefined,
      status: dto.status as BudgetStatus,
      categories: dto.categories.map((category) => this.categoryToDomain(category)),
    };
  }

  private static categoryToDomain(dto: CategorySummaryDto): CategorySummary {
    return {
      id: dto.id,
      name: dto.name,
      color: dto.color,
      limit: dto.limit ?? undefined,
      spent: dto.spent,
      count: dto.count,
      percentOfIncome: dto.percentOfIncome ?? undefined,
      status: dto.status as BudgetStatus,
    };
  }
}
