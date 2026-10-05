import { Observable } from 'rxjs';
import {
  BudgetGroupDraft,
  Category,
  CategoryCatalog,
  CategoryDraft,
} from '../../entities/category.entity';

export abstract class CategoriesRepository {
  abstract getCatalog(includeArchived?: boolean): Observable<CategoryCatalog>;
  abstract createCategory(draft: CategoryDraft): Observable<Category>;
  abstract updateCategory(id: string, draft: CategoryDraft): Observable<Category>;
  abstract setCategoryArchived(id: string, archived: boolean): Observable<Category>;
  abstract createGroup(draft: BudgetGroupDraft): Observable<void>;
  abstract updateGroup(id: string, draft: BudgetGroupDraft): Observable<void>;
  abstract deleteGroup(id: string): Observable<void>;
}
