import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, LOCALE_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArchive,
  lucideArchiveRestore,
  lucideArrowLeft,
  lucidePencil,
  lucidePlus,
  lucideTrash2,
} from '@ng-icons/lucide';
import {
  BUDGET_COLORS,
  BudgetGroup,
  BudgetGroupKind,
  Category,
} from '../../../domain/entities/category.entity';
import { Currency } from '../../../domain/entities/transaction.entity';
import { BudgetFacade } from '../../facades/budget.facade';
import { CategoriesFacade } from '../../facades/categories.facade';
import { currentBogotaMonth } from '../../utils/month';
import { formatMoney } from '../../pipes/format-money';

const NEW = 'new';

interface CategorySection {
  id: string | null;
  name: string;
  isSavings: boolean;
  categories: Category[];
}

@Component({
  selector: 'app-budget-settings',
  imports: [
    HlmButton,
    HlmCardImports,
    HlmInput,
    NgIcon,
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './budget-settings.html',
  providers: [
    provideIcons({
      lucideArchive,
      lucideArchiveRestore,
      lucideArrowLeft,
      lucidePencil,
      lucidePlus,
      lucideTrash2,
    }),
  ],
})
export class BudgetSettings {
  protected readonly budgetFacade = inject(BudgetFacade);
  protected readonly categoriesFacade = inject(CategoriesFacade);
  private readonly locale = inject(LOCALE_ID);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly colors = BUDGET_COLORS;
  protected readonly kinds = BudgetGroupKind;
  protected readonly newId = NEW;

  protected readonly error = signal<string | null>(null);
  protected readonly editingGroupId = signal<string | null>(null);
  protected readonly editingCategoryId = signal<string | null>(null);
  protected readonly newCategorySection = signal<string | null>(null);
  protected readonly confirmingDelete = signal<string | null>(null);
  protected readonly showArchived = signal(false);

  protected readonly incomeForm = this.formBuilder.nonNullable.group({
    effectiveFrom: [currentBogotaMonth(), [Validators.required, Validators.pattern(/^\d{4}-\d{2}$/)]],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  protected readonly groupForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
    kind: [BudgetGroupKind.SPENDING],
    targetPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    color: [BUDGET_COLORS[0] as string],
  });

  protected readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(40)]],
    groupId: [''],
    monthlyLimit: [null as number | null, [Validators.min(1)]],
    color: [BUDGET_COLORS[0] as string],
  });

  protected readonly groups = computed<BudgetGroup[]>(
    () => this.categoriesFacade.state().catalog?.groups ?? [],
  );

  protected readonly percentTotal = this.categoriesFacade.targetPercentTotal;

  protected readonly percentWarning = computed(() => {
    const total = Math.round(this.percentTotal() * 10) / 10;
    if (total === 100) return null;
    return total < 100
      ? `Los grupos suman ${total}%: queda ${Math.round((100 - total) * 10) / 10}% sin repartir.`
      : `Los grupos suman ${total}%: te pasas por ${Math.round((total - 100) * 10) / 10}%.`;
  });

  protected readonly sections = computed<CategorySection[]>(() => {
    const catalog = this.categoriesFacade.state().catalog;
    if (!catalog) return [];

    const active = (categories: Category[]) => categories.filter((category) => !category.archived);
    const sections: CategorySection[] = catalog.groups.map((group) => ({
      id: group.id,
      name: group.name,
      isSavings: group.kind === BudgetGroupKind.SAVINGS,
      categories: active(group.categories),
    }));

    const ungrouped = active(catalog.ungrouped);
    return ungrouped.length > 0
      ? [...sections, { id: null, name: 'Sin grupo', isSavings: false, categories: ungrouped }]
      : sections;
  });

  protected readonly archived = computed(() =>
    this.categoriesFacade.categories().filter((category) => category.archived),
  );

  constructor() {
    this.categoriesFacade.load();
    this.budgetFacade.loadIncomes();
  }

  monthLabel(month: string): string {
    const label = new Date(`${month}-01T12:00:00`).toLocaleDateString(this.locale, {
      month: 'long',
      year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  money(value: number): string {
    return formatMoney(value, Currency.COP, this.locale);
  }

  limitLabel(category: Category, isSavings: boolean): string {
    if (!category.monthlyLimit) return isSavings ? 'Sin meta' : 'Sin límite';
    return `${isSavings ? 'Meta' : 'Límite'} ${this.money(category.monthlyLimit)} al mes`;
  }

  saveIncome(): void {
    if (this.incomeForm.invalid) {
      this.incomeForm.markAllAsTouched();
      return;
    }

    const { effectiveFrom, amount } = this.incomeForm.getRawValue();
    this.run(this.budgetFacade.saveIncome(effectiveFrom, amount!), () =>
      this.incomeForm.controls.amount.reset(),
    );
  }

  deleteIncome(effectiveFrom: string): void {
    if (!this.confirm(`income:${effectiveFrom}`)) return;
    this.run(this.budgetFacade.deleteIncome(effectiveFrom));
  }

  startGroupEdit(group?: BudgetGroup): void {
    this.error.set(null);
    this.editingCategoryId.set(null);
    this.editingGroupId.set(group?.id ?? NEW);
    this.groupForm.reset({
      name: group?.name ?? '',
      kind: group?.kind ?? BudgetGroupKind.SPENDING,
      targetPercent: group?.targetPercent ?? Math.max(0, 100 - this.percentTotal()),
      color: group?.color ?? BUDGET_COLORS[0],
    });
  }

  saveGroup(): void {
    const id = this.editingGroupId();
    if (!id) return;
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }

    const raw = this.groupForm.getRawValue();
    const draft = { ...raw, name: raw.name.trim() };
    const request =
      id === NEW
        ? this.categoriesFacade.createGroup(draft)
        : this.categoriesFacade.updateGroup(id, draft);

    this.run(request, () => this.editingGroupId.set(null));
  }

  deleteGroup(group: BudgetGroup): void {
    if (!this.confirm(`group:${group.id}`)) return;
    this.run(this.categoriesFacade.deleteGroup(group.id));
  }

  startCategoryEdit(category?: Category, groupId?: string | null): void {
    this.error.set(null);
    this.editingGroupId.set(null);
    this.editingCategoryId.set(category?.id ?? NEW);
    this.newCategorySection.set(category ? null : (groupId ?? null));
    this.categoryForm.reset({
      name: category?.name ?? '',
      groupId: category?.groupId ?? groupId ?? this.groups()[0]?.id ?? '',
      monthlyLimit: category?.monthlyLimit ?? null,
      color: category?.color ?? BUDGET_COLORS[0],
    });
  }

  saveCategory(): void {
    const id = this.editingCategoryId();
    if (!id) return;
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const raw = this.categoryForm.getRawValue();
    const draft = {
      name: raw.name.trim(),
      color: raw.color,
      groupId: raw.groupId || null,
      monthlyLimit: raw.monthlyLimit || null,
    };
    const request =
      id === NEW
        ? this.categoriesFacade.createCategory(draft)
        : this.categoriesFacade.updateCategory(id, draft);

    this.run(request, () => this.editingCategoryId.set(null));
  }

  setArchived(category: Category, archived: boolean): void {
    this.run(this.categoriesFacade.setCategoryArchived(category.id, archived));
  }

  cancelEdit(): void {
    this.editingGroupId.set(null);
    this.editingCategoryId.set(null);
    this.error.set(null);
  }

  private confirm(key: string): boolean {
    if (this.confirmingDelete() === key) {
      this.confirmingDelete.set(null);
      return true;
    }
    this.confirmingDelete.set(key);
    return false;
  }

  private run(request: Observable<unknown>, onSuccess?: () => void): void {
    this.error.set(null);
    request.subscribe({
      next: () => onSuccess?.(),
      error: (error: HttpErrorResponse) =>
        this.error.set(error.error?.error ?? 'No se pudo guardar el cambio. Intenta de nuevo.'),
    });
  }
}
