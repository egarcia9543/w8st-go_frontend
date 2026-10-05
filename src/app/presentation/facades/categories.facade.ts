import { computed, inject, Injectable, signal } from '@angular/core';
import { GetCategoriesUseCase } from '../../application/use-cases/get-categories/get-categories.use-case';
import { Category, CategoryCatalog } from '../../domain/entities/category.entity';

export interface CategoriesState {
  catalog: CategoryCatalog | null;
  loading: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class CategoriesFacade {
  private readonly getCategoriesUseCase = inject(GetCategoriesUseCase);

  private readonly _state = signal<CategoriesState>({ catalog: null, loading: false, error: false });
  readonly state = this._state.asReadonly();

  readonly categories = computed<Category[]>(() => {
    const catalog = this._state().catalog;
    if (!catalog) return [];
    return [...catalog.groups.flatMap((group) => group.categories), ...catalog.ungrouped];
  });

  readonly byId = computed(
    () => new Map(this.categories().map((category) => [category.id, category])),
  );

  ensureLoaded(): void {
    const { catalog, loading } = this._state();
    if (catalog || loading) return;
    this.load();
  }

  load(): void {
    this._state.update((state) => ({ ...state, loading: true, error: false }));

    this.getCategoriesUseCase.execute().subscribe({
      next: (catalog) => this._state.set({ catalog, loading: false, error: false }),
      error: () => this._state.set({ catalog: null, loading: false, error: true }),
    });
  }
}
