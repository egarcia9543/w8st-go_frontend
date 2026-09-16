import { CardKind } from '../../../domain/entities/transaction.entity';

export const CARD_KIND_LABELS: Record<string, string> = {
  [CardKind.CREDIT]: 'Crédito',
  [CardKind.DEBIT]: 'Débito',
  [CardKind.ACCOUNT]: 'Cuenta',
};

const DEBIT_ART = 'imgs/DEBIT.png';
const AMEX_ART = 'imgs/AMEX.webp';
const MASTERCARD_ART = 'imgs/MC.webp';

export const cardArtFor = (kind: CardKind, alias?: string): string => {
  if (kind === CardKind.DEBIT || kind === CardKind.ACCOUNT) return DEBIT_ART;
  if (alias && /american\s*express|amex/i.test(alias)) return AMEX_ART;
  return MASTERCARD_ART;
};

export const cardDisplayName = (kind: CardKind, last4: string, alias?: string): string =>
  alias ?? `${CARD_KIND_LABELS[kind]} *${last4}`;
