import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, LOCALE_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArchive,
  lucideArchiveRestore,
  lucideBanknote,
  lucidePencil,
  lucidePlus,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import {
  ANNUAL_RATE_MAX,
  Debt,
  DEBT_KIND_LABELS,
  DebtDraft,
  DebtKind,
  DebtPayoff,
} from '../../../domain/entities/debt.entity';
import { Currency } from '../../../domain/entities/transaction.entity';
import { DebtsFacade } from '../../facades/debts.facade';
import { formatMoney } from '../../pipes/format-money';

const NEW_DEBT_ID = 'new';

interface DebtView {
  id: string;
  debt: Debt;
  name: string;
  kindLabel: string;
  balanceLabel: string;
  rateLabel: string;
  paymentLabel: string;
  paidByOther: boolean;
  notes: string | null;
  order: number | null;
  payoffLabel: string | null;
  interestLabel: string | null;
  neverPaysOff: boolean;
}

@Component({
  selector: 'app-debts',
  imports: [
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmSkeletonImports,
    NgIcon,
    NgTemplateOutlet,
    ReactiveFormsModule,
  ],
  templateUrl: './debts.html',
  providers: [
    provideIcons({
      lucideArchive,
      lucideArchiveRestore,
      lucideBanknote,
      lucidePencil,
      lucidePlus,
      lucideTriangleAlert,
    }),
  ],
})
export class Debts {
  protected readonly debtsFacade = inject(DebtsFacade);

  private readonly locale = inject(LOCALE_ID);
  private readonly formBuilder = inject(FormBuilder);

  private readonly monthFormatter = new Intl.DateTimeFormat(this.locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  protected readonly skeletonItems = [0, 1, 2];
  protected readonly kinds = DebtKind;
  protected readonly kindLabels = DEBT_KIND_LABELS;
  protected readonly newDebtId = NEW_DEBT_ID;

  protected readonly editingId = signal<string | null>(null);
  protected readonly payingId = signal<string | null>(null);
  protected readonly showArchived = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    kind: [DebtKind.CREDIT_CARD as DebtKind, Validators.required],
    balance: [null as number | null, [Validators.required, Validators.min(0)]],
    annualRate: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(ANNUAL_RATE_MAX)],
    ],
    monthlyPayment: [null as number | null, [Validators.required, Validators.min(1)]],
    paidByOther: [false],
    notes: [''],
  });

  protected readonly paymentForm = this.formBuilder.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  protected readonly extraForm = this.formBuilder.group({
    extra: [null as number | null, [Validators.min(0)]],
  });

  private readonly payoffById = computed(() => {
    const plan = this.debtsFacade.planState().plan;
    const byId = new Map<string, DebtPayoff>();

    for (const row of [...(plan?.debts ?? []), ...(plan?.paidByOther ?? [])]) {
      byId.set(row.id, row);
    }

    return byId;
  });

  // Las propias en el orden de la avalancha; luego las que paga otra persona y
  // al final las que ya están en cero.
  protected readonly views = computed(() =>
    this.debtsFacade
      .activeDebts()
      .map((debt) => this.toView(debt))
      .sort((a, b) => this.rank(a) - this.rank(b)),
  );

  protected readonly archivedViews = computed(() =>
    this.debtsFacade.archivedDebts().map((debt) => this.toView(debt)),
  );

  protected readonly summary = computed(() => {
    const plan = this.debtsFacade.planState().plan;
    if (!plan) return null;

    return {
      totalBalance: this.money(plan.totalBalance),
      monthlyPayment: this.money(plan.monthlyPayment),
      totalInterest: this.money(plan.totalInterest),
      debtFree: plan.debtFreeMonth ? this.monthLabel(plan.debtFreeMonth) : null,
      othersCount: plan.paidByOther.length,
    };
  });

  constructor() {
    this.debtsFacade.loadDebts();
    this.debtsFacade.loadPlan();
    this.extraForm.reset({ extra: this.debtsFacade.extraPerMonth() || null });
  }

  applyExtra(): void {
    if (this.extraForm.invalid) {
      this.extraForm.markAllAsTouched();
      return;
    }

    this.debtsFacade.loadPlan(this.extraForm.getRawValue().extra ?? 0);
  }

  startCreating(): void {
    this.saveError.set(null);
    this.payingId.set(null);
    this.editingId.set(NEW_DEBT_ID);
    this.form.reset({
      name: '',
      kind: DebtKind.CREDIT_CARD,
      balance: null,
      annualRate: null,
      monthlyPayment: null,
      paidByOther: false,
      notes: '',
    });
  }

  startEditing(debt: Debt): void {
    this.saveError.set(null);
    this.payingId.set(null);
    this.editingId.set(debt.id);
    this.form.reset({
      name: debt.name,
      kind: debt.kind,
      balance: debt.balance,
      annualRate: debt.annualRate,
      monthlyPayment: debt.monthlyPayment,
      paidByOther: debt.paidByOther,
      notes: debt.notes ?? '',
    });
  }

  cancelEditing(): void {
    this.editingId.set(null);
    this.saveError.set(null);
  }

  save(): void {
    const id = this.editingId();
    if (!id) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const draft: DebtDraft = {
      name: raw.name?.trim() ?? '',
      kind: raw.kind ?? DebtKind.OTHER,
      balance: raw.balance ?? 0,
      annualRate: raw.annualRate ?? 0,
      monthlyPayment: raw.monthlyPayment ?? 0,
      paidByOther: raw.paidByOther ?? false,
      notes: raw.notes?.trim() || null,
    };

    const request =
      id === NEW_DEBT_ID
        ? this.debtsFacade.createDebt(draft)
        : this.debtsFacade.updateDebt(id, draft);

    this.saveError.set(null);
    request.subscribe({
      next: () => this.editingId.set(null),
      error: () => this.saveError.set('No se pudo guardar la deuda. Revisa los datos.'),
    });
  }

  startPaying(debt: Debt): void {
    this.saveError.set(null);
    this.editingId.set(null);
    this.payingId.set(debt.id);
    this.paymentForm.reset({ amount: debt.monthlyPayment });
  }

  cancelPaying(): void {
    this.payingId.set(null);
  }

  registerPayment(): void {
    const id = this.payingId();
    if (!id) return;

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.saveError.set(null);
    this.debtsFacade.registerPayment(id, this.paymentForm.getRawValue().amount ?? 0).subscribe({
      next: () => this.payingId.set(null),
      error: () => this.saveError.set('No se pudo registrar el pago.'),
    });
  }

  toggleArchived(debt: Debt): void {
    this.saveError.set(null);

    this.debtsFacade.setArchived(debt.id, !debt.archived).subscribe({
      error: () => this.saveError.set('No se pudo archivar la deuda.'),
    });
  }

  retry(): void {
    this.debtsFacade.loadDebts();
    this.debtsFacade.loadPlan();
  }

  private rank(view: DebtView): number {
    if (view.debt.balance <= 0) return 3000;
    if (view.paidByOther) return 2000 + (view.order ?? 999);
    return view.order ?? 999;
  }

  private toView(debt: Debt): DebtView {
    const payoff = this.payoffById().get(debt.id);
    const inPlan = payoff !== undefined;

    return {
      id: debt.id,
      debt,
      name: debt.name,
      kindLabel: DEBT_KIND_LABELS[debt.kind] ?? DEBT_KIND_LABELS[DebtKind.OTHER],
      balanceLabel: this.money(debt.balance),
      rateLabel: `${debt.annualRate.toLocaleString(this.locale)} % E.A.`,
      paymentLabel: this.money(debt.monthlyPayment),
      paidByOther: debt.paidByOther,
      notes: debt.notes ?? null,
      order: payoff?.order ?? null,
      payoffLabel: payoff?.payoffMonth ? this.monthLabel(payoff.payoffMonth) : null,
      interestLabel: payoff ? this.money(payoff.interestPaid) : null,
      neverPaysOff: inPlan && !payoff.payoffMonth,
    };
  }

  private money(value: number): string {
    return formatMoney(value, Currency.COP, this.locale);
  }

  private monthLabel(month: string): string {
    const [year, monthNumber] = month.split('-').map(Number);
    return this.monthFormatter.format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  }
}
