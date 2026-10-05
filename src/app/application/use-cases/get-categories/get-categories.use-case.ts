import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryCatalog } from '../../../domain/entities/category.entity';
import { CategoriesRepository } from '../../../domain/repositories/categories/categories.repository';

@Injectable({ providedIn: 'root' })
export class GetCategoriesUseCase {
  private readonly categoriesRepository = inject(CategoriesRepository);

  execute(includeArchived = false): Observable<CategoryCatalog> {
    return this.categoriesRepository.getCatalog(includeArchived);
  }
}
