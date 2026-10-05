import {
  BudgetGroup,
  BudgetGroupKind,
  Category,
  CategoryCatalog,
} from '../../../domain/entities/category.entity';
import { BudgetGroupDto, CategoryCatalogDto, CategoryDto } from '../../models/category.dto';

export class CategoryMapper {
  static catalogToDomain(dto: CategoryCatalogDto): CategoryCatalog {
    return {
      groups: dto.groups.map((group) => this.groupToDomain(group)),
      ungrouped: dto.ungrouped.map((category) => this.toDomain(category)),
    };
  }

  static groupToDomain(dto: BudgetGroupDto): BudgetGroup {
    return {
      id: dto.id,
      name: dto.name,
      kind: dto.kind as BudgetGroupKind,
      targetPercent: dto.targetPercent,
      color: dto.color,
      position: dto.position,
      categories: dto.categories.map((category) => this.toDomain(category)),
    };
  }

  static toDomain(dto: CategoryDto): Category {
    return {
      id: dto.id,
      name: dto.name,
      color: dto.color,
      groupId: dto.groupId ?? undefined,
      monthlyLimit: dto.monthlyLimit ?? undefined,
      archived: dto.archived,
      position: dto.position,
    };
  }
}
