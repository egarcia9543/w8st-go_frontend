import { Component, computed, inject, input, LOCALE_ID } from '@angular/core';
import { CardSpend } from '../../../domain/entities/card-spend.entity';
import { CardKind } from '../../../domain/entities/transaction.entity';
import { formatMoney } from '../../pipes/format-money';

const KIND_LABELS: Record<string, string> = {
  [CardKind.CREDIT]: 'Crédito',
  [CardKind.DEBIT]: 'Débito',
  [CardKind.ACCOUNT]: 'Cuenta',
};

const DEBIT_ART = 'imgs/DEBIT.png';
const AMEX_ART = 'imgs/AMEX.webp';
const MASTERCARD_ART = 'imgs/MC.webp';

const artFor = (kind: CardKind, alias?: string): string => {
  if (kind === CardKind.DEBIT || kind === CardKind.ACCOUNT) return DEBIT_ART;
  if (alias && /american\s*express|amex/i.test(alias)) return AMEX_ART;
  return MASTERCARD_ART;
};

@Component({
  selector: 'app-card-tile',
  templateUrl: './card-tile.html',
})
export class CardTile {
  readonly card = input.required<CardSpend>();

  private readonly locale = inject(LOCALE_ID);

  protected readonly name = computed(() => {
    const card = this.card();
    return card.alias ?? `${KIND_LABELS[card.kind]} *${card.last4}`;
  });

  protected readonly art = computed(() => artFor(this.card().kind, this.card().alias));

  protected readonly total = computed(() => {
    const card = this.card();
    return formatMoney(card.total, card.currency, this.locale);
  });

  protected readonly detail = computed(() => {
    const count = this.card().count;
    return `${count} ${count === 1 ? 'movimiento' : 'movimientos'}`;
  });
}
