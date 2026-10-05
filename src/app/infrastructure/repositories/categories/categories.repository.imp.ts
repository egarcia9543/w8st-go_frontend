import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  BudgetGroupDraft,
  Category,
  CategoryCatalog,
  CategoryDraft,
} from '../../../domain/entities/category.entity';
import { CategoriesRepository } from '../../../domain/repositories/categories/categories.repository';
import { CategoriesApiDatasource } from '../../datasources/categories/categories.api.datasource';
import { CategoryMapper } from '../../mappers/categories/category.mapper';

@Injectable()
export class CategoriesRepositoryImp implements CategoriesRepository {
  private readonly categoriesDatasource = inject(CategoriesApiDatasource);

  getCatalog(includeArchived = false): Observable<CategoryCatalog> {
    return this.categoriesDatasource
      .getCatalog(includeArchived)
      .pipe(map((dto) => CategoryMapper.catalogToDomain(dto)));
  }

  createCategory(draft: CategoryDraft): Observable<Category> {
    return this.categoriesDatasource
      .createCategory(draft)
      .pipe(map((dto) => CategoryMapper.toDomain(dto)));
  }

  updateCategory(id: string, draft: CategoryDraft): Observable<Category> {
    return this.categoriesDatasource
      .updateCategory(id, draft)
      .pipe(map((dto) => CategoryMapper.toDomain(dto)));
  }

  setCategoryArchived(id: string, archived: boolean): Observable<Category> {
    return this.categoriesDatasource
      .updateCategory(id, { archived })
      .pipe(map((dto) => CategoryMapper.toDomain(dto)));
  }

  createGroup(draft: BudgetGroupDraft): Observable<void> {
    return this.categoriesDatasource.createGroup(draft).pipe(map(() => undefined));
  }

  updateGroup(id: string, draft: BudgetGroupDraft): Observable<void> {
    return this.categoriesDatasource.updateGroup(id, draft).pipe(map(() => undefined));
  }

  deleteGroup(id: string): Observable<void> {
    return this.categoriesDatasource.deleteGroup(id);
  }
}
