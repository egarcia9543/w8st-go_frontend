import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, CategoryDraft } from '../../../domain/entities/category.entity';
import { CategoriesRepository } from '../../../domain/repositories/categories/categories.repository';

@Injectable({ providedIn: 'root' })
export class ManageCategoriesUseCase {
  private readonly categoriesRepository = inject(CategoriesRepository);

  create(draft: CategoryDraft): Observable<Category> {
    return this.categoriesRepository.createCategory(draft);
  }

  update(id: string, draft: CategoryDraft): Observable<Category> {
    return this.categoriesRepository.updateCategory(id, draft);
  }

  setArchived(id: string, archived: boolean): Observable<Category> {
    return this.categoriesRepository.setCategoryArchived(id, archived);
  }
}
