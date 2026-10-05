import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BudgetGroupDraft } from '../../../domain/entities/category.entity';
import { CategoriesRepository } from '../../../domain/repositories/categories/categories.repository';

@Injectable({ providedIn: 'root' })
export class ManageBudgetGroupsUseCase {
  private readonly categoriesRepository = inject(CategoriesRepository);

  create(draft: BudgetGroupDraft): Observable<void> {
    return this.categoriesRepository.createGroup(draft);
  }

  update(id: string, draft: BudgetGroupDraft): Observable<void> {
    return this.categoriesRepository.updateGroup(id, draft);
  }

  remove(id: string): Observable<void> {
    return this.categoriesRepository.deleteGroup(id);
  }
}
