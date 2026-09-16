import { Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { CardSpend, SpendBasis } from '../../../domain/entities/card-spend.entity';
import { formatMoney } from '../../pipes/format-money';
import { formatCycleRange, formatDueLabel } from '../../pipes/format-cycle';
import { cardArtFor, cardDisplayName } from './card-art';

@Component({
  selector: 'app-card-tile',
  templateUrl: './card-tile.html',
})
export class CardTile {
  readonly card = input.required<CardSpend>();

  private readonly locale = inject(LOCALE_ID);

  protected readonly name = computed(() => {
    const card = this.card();
    return cardDisplayName(card.kind, card.last4, card.alias);
  });

  protected readonly art = computed(() => cardArtFor(this.card().kind, this.card().alias));

  protected readonly total = computed(() => {
    const card = this.card();
    return formatMoney(card.total, card.currency, this.locale);
  });

  private readonly cycle = computed(() => {
    const period = this.card().period;
    return period?.basis === SpendBasis.CYCLE && period.closesOn ? period : null;
  });

  protected readonly periodLabel = computed(() => {
    const cycle = this.cycle();
    if (!cycle) return 'Gasto del mes';

    return `Ciclo · ${formatCycleRange(cycle.from, cycle.closesOn!, this.locale)}`;
  });

  protected readonly dueLabel = computed(() => {
    const dueDate = this.cycle()?.paymentDueDate;
    return dueDate ? formatDueLabel(dueDate, this.locale) : null;
  });

  protected readonly utilizationPercent = computed(() => {
    const utilization = this.card().utilization;
    return utilization === undefined ? null : Math.round(utilization * 100);
  });

  protected readonly detail = computed(() => {
    const count = this.card().count;
    return `${count} ${count === 1 ? 'movimiento' : 'movimientos'}`;
  });
}
