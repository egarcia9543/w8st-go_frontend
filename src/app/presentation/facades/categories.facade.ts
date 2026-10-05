import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories/get-categories.use-case';
import { ManageBudgetGroupsUseCase } from '../../application/use-cases/manage-budget-groups/manage-budget-groups.use-case';
import { ManageCategoriesUseCase } from '../../application/use-cases/manage-categories/manage-categories.use-case';
import {
  BudgetGroupDraft,
  Category,
  CategoryCatalog,
  CategoryDraft,
} from '../../domain/entities/category.entity';

export interface CategoriesState {
  catalog: CategoryCatalog | null;
  loading: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriesFacade {
  private readonly getCategoriesUseCase = inject(GetCategoriesUseCase);
  private readonly manageCategoriesUseCase = inject(ManageCategoriesUseCase);
  private readonly manageGroupsUseCase = inject(ManageBudgetGroupsUseCase);

  private readonly _state = signal<CategoriesState>({ catalog: null, loading: false, error: false });
  readonly state = this._state.asReadonly();

  private readonly _saving = signal(false);
  readonly saving = this._saving.asReadonly();

  readonly activeCatalog = computed<CategoryCatalog | null>(() => {
    const catalog = this._state().catalog;
    if (!catalog) return null;

    const active = (categories: Category[]) => categories.filter((category) => !category.archived);
    return {
      groups: catalog.groups.map((group) => ({ ...group, categories: active(group.categories) })),
      ungrouped: active(catalog.ungrouped),
    };
  });

  readonly categories = computed<Category[]>(() => {
    const catalog = this._state().catalog;
    if (!catalog) return [];
    return [...catalog.groups.flatMap((group) => group.categories), ...catalog.ungrouped];
  });

  readonly byId = computed(
    () => new Map(this.categories().map((category) => [category.id, category])),
  );

  readonly targetPercentTotal = computed(
    () => this._state().catalog?.groups.reduce((sum, group) => sum + group.targetPercent, 0) ?? 0,
  );

  ensureLoaded(): void {
    const { catalog, loading } = this._state();
    if (catalog || loading) return;
    this.load();
  }

  load(): void {
    this._state.update((state) => ({ ...state, loading: true, error: false }));

    this.getCategoriesUseCase.execute(true).subscribe({
      next: (catalog) => this._state.set({ catalog, loading: false, error: false }),
      error: () => this._state.set({ catalog: null, loading: false, error: true }),
    });
  }

  createCategory(draft: CategoryDraft): Observable<unknown> {
    return this.mutate(this.manageCategoriesUseCase.create(draft));
  }

  updateCategory(id: string, draft: CategoryDraft): Observable<unknown> {
    return this.mutate(this.manageCategoriesUseCase.update(id, draft));
  }

  setCategoryArchived(id: string, archived: boolean): Observable<unknown> {
    return this.mutate(this.manageCategoriesUseCase.setArchived(id, archived));
  }

  createGroup(draft: BudgetGroupDraft): Observable<unknown> {
    return this.mutate(this.manageGroupsUseCase.create(draft));
  }

  updateGroup(id: string, draft: BudgetGroupDraft): Observable<unknown> {
    return this.mutate(this.manageGroupsUseCase.update(id, draft));
  }

  deleteGroup(id: string): Observable<unknown> {
    return this.mutate(this.manageGroupsUseCase.remove(id));
  }

  private mutate<T>(request: Observable<T>): Observable<T> {
    this._saving.set(true);
    return request.pipe(
      tap(() => this.load()),
      finalize(() => this._saving.set(false)),
    );
  }
}
