import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, LOCALE_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArchive,
  lucideArchiveRestore,
  lucideBanknote,
  lucideCalendarPlus,
  lucideCheck,
  lucideClock,
  lucideFlag,
  lucideChartLine,
  lucidePencil,
  lucidePlus,
  lucideTarget,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { BudgetGroupKind } from '../../../domain/entities/category.entity';
import {
  ANNUAL_RATE_MAX,
  Debt,
  DEBT_KIND_LABELS,
  DEBT_STRATEGY_LABELS,
  DebtDraft,
  DebtKind,
  DebtPayoff,
  DebtStrategy,
  DUE_DAY_MAX,
  DUE_DAY_MIN,
} from '../../../domain/entities/debt.entity';
import { Currency } from '../../../domain/entities/transaction.entity';
import { BudgetFacade } from '../../facades/budget.facade';
import { DebtsFacade } from '../../facades/debts.facade';
import { formatMoney } from '../../pipes/format-money';
import { buildDebtCalendar } from '../../utils/debt-calendar';
import { DueItem, DueStatus } from '../../utils/debt-schedule';
import { currentBogotaMonth } from '../../utils/month';

const NEW_DEBT_ID = 'new';
const USD_ALERT_KEY = 'w8st.debts.usdAlertSeen';

interface DebtView {
  id: string;
  debt: Debt;
  name: string;
  kindLabel: string;
  balanceLabel: string;
  rateLabel: string;
  paymentLabel: string;
  dueDayLabel: string | null;
  paidByOther: boolean;
  notes: string | null;
  payoffLabel: string | null;
  interestLabel: string | null;
  neverPaysOff: boolean;
}

interface ChecklistRow {
  id: string;
  debt: Debt;
  name: string;
  detail: string;
  amountLabel: string;
  status: DueStatus;
  badge: string;
}

interface AttackRow {
  id: string;
  order: number | null;
  name: string;
  rateLabel: string;
  balanceLabel: string;
  payoffLabel: string;
  isTarget: boolean;
  onlyInstallment: boolean;
  paidByOther: boolean;
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
    RouterLink,
  ],
  templateUrl: './debts.html',
  providers: [
    provideIcons({
      lucideArchive,
      lucideArchiveRestore,
      lucideBanknote,
      lucideCalendarPlus,
      lucideChartLine,
      lucideCheck,
      lucideClock,
      lucideFlag,
      lucidePencil,
      lucidePlus,
      lucideTarget,
      lucideTriangleAlert,
    }),
  ],
})
export class Debts {
  protected readonly debtsFacade = inject(DebtsFacade);
  protected readonly budgetFacade = inject(BudgetFacade);

  private readonly locale = inject(LOCALE_ID);
  private readonly formBuilder = inject(FormBuilder);

  private readonly monthFormatter = new Intl.DateTimeFormat(this.locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  private readonly shortMonthFormatter = new Intl.DateTimeFormat(this.locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  private readonly dayFormatter = new Intl.DateTimeFormat(this.locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  private readonly todayFormatter = new Intl.DateTimeFormat(this.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  protected readonly skeletonItems = [0, 1, 2];
  protected readonly kinds = DebtKind;
  protected readonly kindLabels = DEBT_KIND_LABELS;
  protected readonly strategies = DebtStrategy;
  protected readonly strategyLabels = DEBT_STRATEGY_LABELS;
  protected readonly statuses = DueStatus;
  protected readonly newDebtId = NEW_DEBT_ID;
  protected readonly dueDayRange = `${DUE_DAY_MIN}–${DUE_DAY_MAX}`;

  protected readonly editingId = signal<string | null>(null);
  protected readonly payingId = signal<string | null>(null);
  protected readonly showArchived = signal(false);
  protected readonly saveError = signal<string | null>(null);
  private readonly usdAlertSeen = signal(this.readUsdAlertSeen());

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required, Validators.maxLength(60)]],
    kind: [DebtKind.CREDIT_CARD as DebtKind, Validators.required],
    balance: [null as number | null, [Validators.required, Validators.min(0)]],
    annualRate: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(ANNUAL_RATE_MAX)],
    ],
    monthlyPayment: [null as number | null, [Validators.required, Validators.min(1)]],
    dueDay: [null as number | null, [Validators.min(DUE_DAY_MIN), Validators.max(DUE_DAY_MAX)]],
    paidByOther: [false],
    notes: [''],
  });

  protected readonly paymentForm = this.formBuilder.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  protected readonly extraForm = this.formBuilder.group({
    extra: [null as number | null, [Validators.min(0)]],
  });

  protected readonly todayLabel = computed(() =>
    this.todayFormatter.format(this.isoToDate(this.debtsFacade.today())),
  );

  protected readonly monthName = computed(() =>
    this.monthLabel(this.debtsFacade.today().slice(0, 7)).replace(/ de \d{4}$/, ''),
  );

  private readonly payoffById = computed(() => {
    const plan = this.debtsFacade.planState().plan;
    const byId = new Map<string, DebtPayoff>();

    for (const row of [...(plan?.debts ?? []), ...(plan?.paidByOther ?? [])]) {
      byId.set(row.id, row);
    }

    return byId;
  });

  /** Lo más urgente sin pagar: lo vencido o lo que vence en los próximos días. */
  protected readonly urgent = computed(() => {
    const item = this.debtsFacade
      .checklist()
      .find((row) => row.status === DueStatus.OVERDUE || row.status === DueStatus.SOON);
    return item ? this.toUrgent(item) : null;
  });

  protected readonly nextPayment = computed(() => {
    const item = this.debtsFacade.checklist().find((row) => row.status === DueStatus.UPCOMING);
    if (!item) return null;
    return `${item.debt.name} · ${this.money(item.remaining)} el ${this.dayLabel(item.dueDate)}`;
  });

  /** La primera deuda del plan que recibe el abono extra. */
  protected readonly target = computed(() => {
    const plan = this.debtsFacade.planState().plan;
    if (!plan) return null;

    const rows = plan.debts.filter((row) => row.receivesExtra && row.balance > 0);
    const first = rows[0];
    const debt = first && this.debtsFacade.activeDebts().find((d) => d.id === first.id);
    if (!first || !debt) return null;

    const extra = plan.extraPerMonth;
    const monthStart = `${this.debtsFacade.today().slice(0, 7)}-01`;
    const paidThisMonth = debt.recentPayments
      .filter((payment) => payment.paidAt.slice(0, 10) >= monthStart)
      .reduce((sum, payment) => sum + payment.amount, 0);
    const goal = debt.monthlyPayment + extra;
    const leftover = extra - first.balance;

    return {
      debt,
      title:
        debt.kind === DebtKind.CREDIT_CARD ? `Deja ${debt.name} en cero` : `Abona a ${debt.name}`,
      balanceLabel: this.money(first.balance),
      rateLabel: `${this.rate(first.annualRate)} E.A.`,
      payoffLabel: first.payoffMonth ? this.monthLabel(first.payoffMonth) : null,
      extraLabel: this.money(extra),
      goalLabel: this.money(goal),
      paidLabel: this.money(paidThisMonth),
      progress: goal > 0 ? Math.min(100, Math.round((paidThisMonth / goal) * 100)) : 0,
      leftoverLabel:
        leftover > 0 && rows[1]
          ? `lo que sobra (${this.money(leftover)}) pasa a ${rows[1].name}`
          : null,
    };
  });

  protected readonly checklistRows = computed(() =>
    this.debtsFacade.checklist().map((item) => this.toChecklistRow(item)),
  );

  protected readonly checklistSummary = computed(() => {
    const items = this.debtsFacade.checklist();
    const paid = items.filter((item) => item.status === DueStatus.PAID);
    const paidAmount = items.reduce(
      (sum, item) => sum + Math.min(item.paid, item.debt.monthlyPayment),
      0,
    );
    const total = items.reduce((sum, item) => sum + item.debt.monthlyPayment, 0);

    return {
      done: paid.length,
      total: items.length,
      paidLabel: this.money(paidAmount),
      percent: total > 0 ? Math.round((paidAmount / total) * 100) : 0,
    };
  });

  protected readonly missingDueDays = computed(
    () =>
      this.debtsFacade
        .activeDebts()
        .filter((debt) => !debt.paidByOther && debt.balance > 0 && debt.dueDay === undefined)
        .length,
  );

  /** Gasto del mes contra los topes de las categorías de gasto que tienen tope. */
  protected readonly pace = computed(() => {
    const summary = this.budgetFacade.state().summary;
    if (!summary || summary.month !== this.debtsFacade.today().slice(0, 7)) return null;

    const capped = [
      ...summary.groups
        .filter((group) => group.kind === BudgetGroupKind.SPENDING)
        .flatMap((group) => group.categories),
      ...summary.ungrouped,
    ].filter((category) => category.limit !== undefined);

    const limit = capped.reduce((sum, category) => sum + (category.limit ?? 0), 0);
    if (limit <= 0) return { configured: false as const };

    const spent = capped.reduce((sum, category) => sum + category.spent, 0);
    const percent = Math.round((spent / limit) * 100);
    const monthPercent = Math.round(summary.monthProgress * 100);
    const top = [...capped]
      .sort((a, b) => b.spent - a.spent)
      .filter((c) => c.spent > 0)
      .slice(0, 2);

    return {
      configured: true as const,
      spentLabel: this.money(spent),
      limitLabel: this.money(limit),
      percent,
      monthPercent,
      ahead: percent > monthPercent,
      topLabel: top.map((category) => `${category.name} ${this.money(category.spent)}`).join(' y '),
    };
  });

  protected readonly usdAlert = computed(() => {
    const summary = this.budgetFacade.state().summary;
    const usd = summary?.foreign.find((row) => row.currency === Currency.USD && row.total > 0);
    if (!summary || !usd) return null;

    const key = `${summary.month}:${usd.count}`;
    if (this.usdAlertSeen() === key) return null;

    return {
      key,
      totalLabel: formatMoney(usd.total, Currency.USD, this.locale),
      count: usd.count,
    };
  });

  protected readonly goal = computed(() => {
    const plan = this.debtsFacade.planState().plan;
    if (!plan) return null;

    const own = this.debtsFacade.state().debts.filter((debt) => !debt.paidByOther);
    const done = own.filter((debt) => debt.balance <= 0).length;
    const months = plan.debtFreeMonth
      ? this.monthsBetween(plan.startMonth, plan.debtFreeMonth)
      : null;
    const firstMilestone = plan.debts.find((row) => row.balance > 0 && row.payoffMonth);

    return {
      debtFree: plan.debtFreeMonth ? this.monthLabel(plan.debtFreeMonth) : null,
      monthsLabel:
        months === null
          ? null
          : months === 0
            ? 'este mes'
            : months === 1
              ? '1 mes'
              : `${months} meses`,
      extraLabel: this.money(plan.extraPerMonth),
      interestLabel: this.money(plan.totalInterest),
      segments: own.map((debt) => debt.balance <= 0),
      done,
      total: own.length,
      milestone: firstMilestone
        ? `${firstMilestone.name}, ${this.monthLabel(firstMilestone.payoffMonth!)}`
        : null,
    };
  });

  protected readonly attackRows = computed(() => {
    const plan = this.debtsFacade.planState().plan;
    if (!plan) return [];

    const targetId = this.target()?.debt.id;
    const own = plan.debts
      .filter((row) => row.balance > 0)
      .map((row) => this.toAttackRow(row, row.id === targetId, false));
    const others = plan.paidByOther
      .filter((row) => row.balance > 0)
      .map((row) => this.toAttackRow(row, false, true));

    // Lo que solo paga cuota va después de lo que se ataca, en el orden del plan.
    return [
      ...own.filter((row) => !row.onlyInstallment),
      ...own.filter((row) => row.onlyInstallment),
      ...others,
    ];
  });

  protected readonly planTotals = computed(() => {
    const plan = this.debtsFacade.planState().plan;
    return plan
      ? { balance: this.money(plan.totalBalance), payment: this.money(plan.monthlyPayment) }
      : null;
  });

  protected readonly views = computed(() =>
    this.debtsFacade.activeDebts().map((debt) => this.toView(debt)),
  );

  protected readonly archivedViews = computed(() =>
    this.debtsFacade.archivedDebts().map((debt) => this.toView(debt)),
  );

  constructor() {
    this.debtsFacade.loadDebts();
    this.debtsFacade.loadPlan();
    this.budgetFacade.loadSummary(currentBogotaMonth());
    this.extraForm.reset({ extra: this.debtsFacade.extraPerMonth() || null });
  }

  applyExtra(): void {
    if (this.extraForm.invalid) {
      this.extraForm.markAllAsTouched();
      return;
    }

    this.debtsFacade.loadPlan(this.extraForm.getRawValue().extra ?? 0);
  }

  setStrategy(strategy: DebtStrategy): void {
    if (strategy === this.debtsFacade.strategy()) return;
    this.debtsFacade.loadPlan(this.debtsFacade.extraPerMonth(), strategy);
  }

  dismissUsdAlert(key: string): void {
    this.usdAlertSeen.set(key);
    try {
      localStorage.setItem(USD_ALERT_KEY, key);
    } catch {
      // Sin storage la alerta vuelve a salir al recargar.
    }
  }

  downloadCalendar(): void {
    const ics = buildDebtCalendar(
      this.debtsFacade.activeDebts(),
      this.debtsFacade.today(),
      (value) => this.money(value),
    );
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pagos-deudas.ics';
    link.click();
    URL.revokeObjectURL(url);
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
      dueDay: null,
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
      dueDay: debt.dueDay ?? null,
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
      dueDay: raw.dueDay ?? null,
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

  startPaying(debt: Debt, amount: number = debt.monthlyPayment): void {
    this.saveError.set(null);
    this.editingId.set(null);
    this.payingId.set(debt.id);
    this.paymentForm.reset({ amount: Math.round(amount) || null });
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

  /** El formulario de pago se abre en el checklist si la deuda está ahí; si no, en su tarjeta. */
  isInChecklist(id: string): boolean {
    return this.checklistRows().some((row) => row.id === id);
  }

  retry(): void {
    this.debtsFacade.loadDebts();
    this.debtsFacade.loadPlan();
  }

  private toUrgent(item: DueItem) {
    const overdue = item.status === DueStatus.OVERDUE;
    const days = Math.abs(item.daysUntil);

    return {
      debt: item.debt,
      overdue,
      title: item.debt.name,
      amountLabel: this.money(item.remaining),
      amount: item.remaining,
      whenLabel: overdue
        ? `Venció el ${this.dayLabel(item.dueDate)} · hace ${days === 1 ? '1 día' : `${days} días`}`
        : item.daysUntil === 0
          ? 'Vence hoy'
          : `Vence el ${this.dayLabel(item.dueDate)} · en ${days === 1 ? '1 día' : `${days} días`}`,
      hint:
        item.debt.kind === DebtKind.CREDIT_CARD
          ? 'Paga lo que pida el extracto. Aquí registra solo la cuota de lo diferido y los abonos extra: lo que compraste en el mes no es deuda del plan.'
          : 'Registra el pago aquí cuando lo hagas para que el plan se actualice.',
    };
  }

  private toChecklistRow(item: DueItem): ChecklistRow {
    const days = Math.abs(item.daysUntil);
    const date = this.dayLabel(item.dueDate);

    let badge: string;
    switch (item.status) {
      case DueStatus.PAID:
        badge = 'Pagado';
        break;
      case DueStatus.OVERDUE:
        badge = `Vencido · ${date}`;
        break;
      default:
        badge =
          item.daysUntil === 0
            ? 'Vence hoy'
            : `En ${days === 1 ? '1 día' : `${days} días`} · ${date}`;
    }

    return {
      id: item.debt.id,
      debt: item.debt,
      name: item.debt.name,
      detail:
        item.status === DueStatus.PAID
          ? `Pagado ${this.money(item.paid)}`
          : item.paid > 0
            ? `Llevas ${this.money(item.paid)} · faltan ${this.money(item.remaining)}`
            : (item.debt.notes ?? this.kindLabels[item.debt.kind]),
      amountLabel: this.money(item.debt.monthlyPayment),
      status: item.status,
      badge,
    };
  }

  private toAttackRow(row: DebtPayoff, isTarget: boolean, paidByOther: boolean): AttackRow {
    const onlyInstallment = !paidByOther && !row.receivesExtra;

    return {
      id: row.id,
      order: paidByOther || onlyInstallment ? null : row.order,
      name: row.name,
      rateLabel: this.rate(row.annualRate),
      balanceLabel: this.money(row.balance),
      payoffLabel: row.payoffMonth
        ? this.shortMonthFormatter.format(this.monthToDate(row.payoffMonth))
        : 'sin fecha',
      isTarget,
      onlyInstallment,
      paidByOther,
    };
  }

  private toView(debt: Debt): DebtView {
    const payoff = this.payoffById().get(debt.id);

    return {
      id: debt.id,
      debt,
      name: debt.name,
      kindLabel: DEBT_KIND_LABELS[debt.kind] ?? DEBT_KIND_LABELS[DebtKind.OTHER],
      balanceLabel: this.money(debt.balance),
      rateLabel: `${this.rate(debt.annualRate)} E.A.`,
      paymentLabel: this.money(debt.monthlyPayment),
      dueDayLabel: debt.dueDay === undefined ? null : `Día ${debt.dueDay} de cada mes`,
      paidByOther: debt.paidByOther,
      notes: debt.notes ?? null,
      payoffLabel: payoff?.payoffMonth ? this.monthLabel(payoff.payoffMonth) : null,
      interestLabel: payoff ? this.money(payoff.interestPaid) : null,
      neverPaysOff: payoff !== undefined && !payoff.payoffMonth,
    };
  }

  private readUsdAlertSeen(): string | null {
    try {
      return localStorage.getItem(USD_ALERT_KEY);
    } catch {
      return null;
    }
  }

  private money(value: number): string {
    return formatMoney(value, Currency.COP, this.locale);
  }

  private rate(value: number): string {
    return `${value.toLocaleString(this.locale, { maximumFractionDigits: 2 })} %`;
  }

  private monthToDate(month: string): Date {
    const [year, monthNumber] = month.split('-').map(Number);
    return new Date(Date.UTC(year, monthNumber - 1, 1));
  }

  private isoToDate(day: string): Date {
    return new Date(`${day}T00:00:00Z`);
  }

  private monthLabel(month: string): string {
    return this.monthFormatter.format(this.monthToDate(month));
  }

  private dayLabel(day: string): string {
    return this.dayFormatter.format(this.isoToDate(day));
  }

  private monthsBetween(from: string, to: string): number {
    const [fromYear, fromMonth] = from.split('-').map(Number);
    const [toYear, toMonth] = to.split('-').map(Number);
    return (toYear - fromYear) * 12 + (toMonth - fromMonth);
  }
}
