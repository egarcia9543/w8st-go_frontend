import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, LOCALE_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight, lucideSettings, lucideTriangleAlert } from '@ng-icons/lucide';
import {
  BudgetStatus,
  CategorySummary,
  GroupSummary,
} from '../../../domain/entities/budget.entity';
import { BudgetGroupKind } from '../../../domain/entities/category.entity';
import { Currency } from '../../../domain/entities/transaction.entity';
import { BudgetBar } from '../../components/budget-bar/budget-bar';
import { BudgetFacade } from '../../facades/budget.facade';
import { formatMoney } from '../../pipes/format-money';
import { currentBogotaMonth, shiftMonth } from '../../utils/month';

interface StatusView {
  label: string | null;
  badgeClass: string;
  barClass: string;
}

interface CategoryView {
  id: string;
  name: string;
  color: string;
  amountLabel: string;
  detail: string;
  fill: number;
  marker: number | null;
  status: StatusView;
}

interface GroupView {
  id: string;
  name: string;
  color: string;
  isSavings: boolean;
  spentLabel: string;
  shareLabel: string;
  fill: number;
  marker: number | null;
  status: StatusView;
  categories: CategoryView[];
}

const STATUS_VIEWS: Record<BudgetStatus, StatusView> = {
  [BudgetStatus.OK]: { label: null, badgeClass: '', barClass: 'bg-emerald-500' },
  [BudgetStatus.AT_RISK]: {
    label: 'En riesgo',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
    barClass: 'bg-amber-500',
  },
  [BudgetStatus.OVER]: {
    label: 'Excedido',
    badgeClass: 'bg-red-500/15 text-red-700 dark:text-red-400',
    barClass: 'bg-red-500',
  },
  [BudgetStatus.REACHED]: {
    label: 'Meta cumplida',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    barClass: 'bg-emerald-500',
  },
  [BudgetStatus.PENDING]: { label: null, badgeClass: '', barClass: 'bg-sky-500' },
  [BudgetStatus.NO_LIMIT]: { label: null, badgeClass: '', barClass: 'bg-muted-foreground/40' },
};

@Component({
  selector: 'app-budget',
  imports: [
    BudgetBar,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmSkeletonImports,
    NgIcon,
    NgTemplateOutlet,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './budget.html',
  providers: [
    provideIcons({ lucideChevronLeft, lucideChevronRight, lucideSettings, lucideTriangleAlert }),
  ],
})
export class Budget {
  protected readonly budgetFacade = inject(BudgetFacade);
  private readonly locale = inject(LOCALE_ID);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly skeletonItems = [0, 1, 2];

  protected readonly incomeAmount = this.formBuilder.control<number | null>(null, [
    Validators.required,
    Validators.min(1),
  ]);

  protected readonly summary = computed(() => this.budgetFacade.state().summary);

  protected readonly monthLabel = computed(() => {
    const label = new Date(`${this.budgetFacade.month()}-01T12:00:00`).toLocaleDateString(
      this.locale,
      { month: 'long', year: 'numeric' },
    );
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  protected readonly isLatestMonth = computed(
    () => this.budgetFacade.month() >= currentBogotaMonth(),
  );

  protected readonly progressLabel = computed(() => {
    const progress = this.summary()?.monthProgress ?? 0;
    if (progress >= 1) return 'Mes cerrado';
    if (progress <= 0) return 'Aún no empieza';
    return `Va el ${Math.round(progress * 100)}% del mes`;
  });

  private readonly marker = computed(() => {
    const progress = this.summary()?.monthProgress ?? 0;
    return progress > 0 && progress < 1 ? progress * 100 : null;
  });

  protected readonly incomeLabel = computed(() => {
    const income = this.summary()?.referenceIncome;
    return income ? this.money(income.amount) : null;
  });

  protected readonly incomeSinceLabel = computed(() => {
    const income = this.summary()?.referenceIncome;
    if (!income) return null;
    const label = new Date(`${income.effectiveFrom}-01T12:00:00`).toLocaleDateString(this.locale, {
      month: 'long',
      year: 'numeric',
    });
    return `vigente desde ${label}`;
  });

  protected readonly unassignedView = computed(() => {
    const summary = this.summary();
    if (!summary?.referenceIncome || summary.unassigned === undefined) return null;

    const percent = Math.round((summary.unassigned / summary.referenceIncome.amount) * 1000) / 10;
    return {
      label: this.money(summary.unassigned),
      percent: `${percent}%`,
      negative: summary.unassigned < 0,
    };
  });

  protected readonly uncategorizedView = computed(() => {
    const summary = this.summary();
    if (!summary || summary.uncategorized.count === 0) return null;
    const count = summary.uncategorized.count;
    return {
      text: `${count === 1 ? '1 gasto' : count + ' gastos'} sin clasificar por ${this.money(summary.uncategorized.spent)}`,
    };
  });

  protected readonly groupViews = computed<GroupView[]>(() =>
    (this.summary()?.groups ?? []).map((group) => this.toGroupView(group)),
  );

  protected readonly ungroupedViews = computed<CategoryView[]>(() =>
    (this.summary()?.ungrouped ?? []).map((category) =>
      this.toCategoryView(category, BudgetGroupKind.SPENDING),
    ),
  );

  protected readonly foreignLabel = computed(() => {
    const foreign = this.summary()?.foreign ?? [];
    if (foreign.length === 0) return null;
    return foreign
      .map(
        (row) =>
          `${formatMoney(row.total, row.currency, this.locale)} en ${row.count === 1 ? '1 compra' : row.count + ' compras'}`,
      )
      .join(' · ');
  });

  constructor() {
    this.budgetFacade.loadSummary(currentBogotaMonth());
  }

  previousMonth(): void {
    this.budgetFacade.loadSummary(shiftMonth(this.budgetFacade.month(), -1));
  }

  nextMonth(): void {
    if (this.isLatestMonth()) return;
    this.budgetFacade.loadSummary(shiftMonth(this.budgetFacade.month(), 1));
  }

  saveIncome(): void {
    const amount = this.incomeAmount.value;
    if (this.incomeAmount.invalid || amount === null) {
      this.incomeAmount.markAsTouched();
      return;
    }

    this.budgetFacade
      .saveIncome(this.budgetFacade.month(), amount)
      .subscribe({ next: () => this.incomeAmount.reset() });
  }

  private money(value: number): string {
    return formatMoney(value, Currency.COP, this.locale);
  }

  private toGroupView(group: GroupSummary): GroupView {
    const isSavings = group.kind === BudgetGroupKind.SAVINGS;
    const share =
      group.percentOfIncome === undefined
        ? 'Sin ingreso de referencia'
        : `${group.percentOfIncome}% · ${isSavings ? 'mín.' : 'máx.'} ${group.targetPercent}%`;

    return {
      id: group.id,
      name: group.name,
      color: group.color,
      isSavings,
      spentLabel: this.money(group.spent),
      shareLabel: share,
      fill: group.limit ? (group.spent / group.limit) * 100 : 0,
      marker: isSavings || !group.limit ? null : this.marker(),
      status: STATUS_VIEWS[group.status],
      categories: group.categories.map((category) => this.toCategoryView(category, group.kind)),
    };
  }

  private toCategoryView(category: CategorySummary, kind: BudgetGroupKind): CategoryView {
    const isSavings = kind === BudgetGroupKind.SAVINGS;
    const movements = `${category.count} ${category.count === 1 ? 'movimiento' : 'movimientos'}`;
    const share =
      category.percentOfIncome === undefined ? null : `${category.percentOfIncome}% del ingreso`;

    return {
      id: category.id,
      name: category.name,
      color: category.color,
      amountLabel: category.limit
        ? `${this.money(category.spent)} / ${this.money(category.limit)}`
        : this.money(category.spent),
      detail: [movements, share, category.limit ? null : isSavings ? 'Sin meta' : 'Sin límite']
        .filter(Boolean)
        .join(' · '),
      fill: category.limit ? (category.spent / category.limit) * 100 : 0,
      marker: isSavings || !category.limit ? null : this.marker(),
      status: STATUS_VIEWS[category.status],
    };
  }
}
