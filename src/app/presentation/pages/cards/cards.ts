import { Component, computed, inject, LOCALE_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArchive, lucideArchiveRestore, lucidePencil, lucideTriangleAlert } from '@ng-icons/lucide';
import { CardSpend } from '../../../domain/entities/card-spend.entity';
import {
  Card,
  CardSettings,
  CUTOFF_DAY_MAX,
  CUTOFF_DAY_MIN,
  GRACE_DAYS_MAX,
  GRACE_DAYS_MIN,
} from '../../../domain/entities/card.entity';
import { Currency } from '../../../domain/entities/transaction.entity';
import { cardArtFor, cardDisplayName } from '../../components/card-tile/card-art';
import { AnalyticsFacade } from '../../facades/analytics.facade';
import { CardsFacade } from '../../facades/cards.facade';
import { formatCycleRange, formatDueLabel, formatLongDate } from '../../pipes/format-cycle';
import { formatMoney } from '../../pipes/format-money';

interface CreditCardView {
  id: string;
  card: Card;
  name: string;
  art: string;
  last4: string;
  issuer: string | null;
  cycleRange: string | null;
  dueLabel: string | null;
  dueDate: string | null;
  spendLabel: string;
  movements: string;
  utilizationPercent: number | null;
  limitLabel: string | null;
  cutoffLabel: string | null;
  graceLabel: string | null;
  needsSetup: boolean;
}

@Component({
  selector: 'app-cards',
  imports: [
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmSkeletonImports,
    NgIcon,
    ReactiveFormsModule,
  ],
  templateUrl: './cards.html',
  styleUrl: './cards.scss',
  providers: [
    provideIcons({ lucideArchive, lucideArchiveRestore, lucidePencil, lucideTriangleAlert }),
  ],
})
export class Cards {
  protected readonly cardsFacade = inject(CardsFacade);
  protected readonly analyticsFacade = inject(AnalyticsFacade);

  private readonly locale = inject(LOCALE_ID);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly skeletonItems = [0, 1];
  protected readonly editingId = signal<string | null>(null);
  protected readonly showArchived = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly cutoffRange = `${CUTOFF_DAY_MIN}–${CUTOFF_DAY_MAX}`;
  protected readonly graceRange = `${GRACE_DAYS_MIN}–${GRACE_DAYS_MAX}`;

  protected readonly form = this.formBuilder.group({
    alias: [''],
    issuer: [''],
    cutoffDay: [
      null as number | null,
      [Validators.min(CUTOFF_DAY_MIN), Validators.max(CUTOFF_DAY_MAX)],
    ],
    paymentGraceDays: [
      null as number | null,
      [Validators.min(GRACE_DAYS_MIN), Validators.max(GRACE_DAYS_MAX)],
    ],
    creditLimit: [null as number | null, [Validators.min(0)]],
  });

  private readonly spendByCard = computed(() => {
    const byCard = new Map<string, CardSpend>();

    for (const row of this.analyticsFacade.currentCycleState().cards) {
      const current = byCard.get(row.cardId);
      if (!current || row.currency === Currency.COP) byCard.set(row.cardId, row);
    }

    return byCard;
  });

  protected readonly views = computed(() =>
    this.cardsFacade.creditCards().map((card) => this.toView(card)),
  );

  protected readonly archivedViews = computed(() =>
    this.cardsFacade.archivedCards().map((card) => this.toView(card)),
  );

  protected readonly pendingSetupCount = computed(() => this.cardsFacade.needsSetup().length);

  constructor() {
    this.cardsFacade.loadCards();
    this.analyticsFacade.loadCurrentCycleSpend();
  }

  startEditing(card: Card): void {
    this.saveError.set(null);
    this.editingId.set(card.id);

    this.form.reset({
      alias: card.alias ?? '',
      issuer: card.issuer ?? '',
      cutoffDay: card.cutoffDay ?? null,
      paymentGraceDays: card.paymentGraceDays ?? null,
      creditLimit: card.creditLimit ?? null,
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
    const settings: CardSettings = {
      alias: this.blankToNull(raw.alias),
      issuer: this.blankToNull(raw.issuer),
      cutoffDay: raw.cutoffDay ?? null,
      paymentGraceDays: raw.paymentGraceDays ?? null,
      creditLimit: raw.creditLimit ?? null,
    };

    this.saveError.set(null);

    this.cardsFacade.updateCard(id, settings).subscribe({
      next: () => {
        this.editingId.set(null);
        this.analyticsFacade.loadCurrentCycleSpend();
      },
      error: () => this.saveError.set('No se pudo guardar la tarjeta. Revisa los datos.'),
    });
  }

  toggleArchived(card: Card): void {
    this.saveError.set(null);

    this.cardsFacade.setArchived(card.id, !card.archived).subscribe({
      next: () => this.analyticsFacade.loadCurrentCycleSpend(),
      error: () => this.saveError.set('No se pudo archivar la tarjeta.'),
    });
  }

  retry(): void {
    this.cardsFacade.loadCards();
    this.analyticsFacade.loadCurrentCycleSpend();
  }

  private blankToNull(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private toView(card: Card): CreditCardView {
    const spend = this.spendByCard().get(card.id);
    const cycle = card.currentCycle;
    const utilization = spend?.utilization;
    const count = spend?.count ?? 0;

    return {
      id: card.id,
      card,
      name: cardDisplayName(card.kind, card.last4, card.alias),
      art: cardArtFor(card.kind, card.alias),
      last4: card.last4,
      issuer: card.issuer ?? null,
      cycleRange:
        cycle?.closesOn ? formatCycleRange(cycle.from, cycle.closesOn, this.locale) : null,
      dueLabel: cycle?.paymentDueDate ? formatDueLabel(cycle.paymentDueDate, this.locale) : null,
      dueDate: cycle?.paymentDueDate ? formatLongDate(cycle.paymentDueDate, this.locale) : null,
      spendLabel: formatMoney(spend?.total ?? 0, spend?.currency ?? Currency.COP, this.locale),
      movements: `${count} ${count === 1 ? 'movimiento' : 'movimientos'}`,
      utilizationPercent: utilization === undefined ? null : Math.round(utilization * 100),
      limitLabel:
        card.creditLimit === undefined
          ? null
          : formatMoney(card.creditLimit, Currency.COP, this.locale),
      cutoffLabel: card.cutoffDay === undefined ? null : `Día ${card.cutoffDay} de cada mes`,
      graceLabel:
        card.paymentGraceDays === undefined
          ? null
          : `${card.paymentGraceDays} días después del corte`,
      needsSetup: card.cutoffDay === undefined,
    };
  }
}
