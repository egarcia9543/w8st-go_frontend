import { Component, computed, effect, inject, LOCALE_ID } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { CardKind } from '../../../domain/entities/transaction.entity';
import { SpendingChart } from '../../components/spending-chart/spending-chart';
import { AnalyticsFacade } from '../../facades/analytics.facade';
import { formatMoney } from '../../pipes/format-money';

interface KpiTile {
  key: string;
  label: string;
  value: string;
  detail: string;
  valueClass: string;
}

interface CardArc {
  d: string;
  color: string;
  width: number;
}

interface CardFace {
  background: string;
  ink: string;
  inkSoft: string;
  chip: string;
  arcs: CardArc[];
  brand: 'mastercard' | 'amex' | 'none';
}

interface CardTile {
  cardId: string;
  name: string;
  kindLabel: string;
  last4: string;
  total: string;
  detail: string;
  face: CardFace;
}

@Component({
  selector: 'app-dashboard',
  imports: [HlmButton, HlmCardImports, HlmSkeletonImports, SpendingChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly analyticsFacade = inject(AnalyticsFacade);
  protected readonly analyticsState = this.analyticsFacade.analyticsState;
  protected readonly skeletonItems = [0, 1, 2, 3];
  protected readonly contactlessWaves = [
    'M8 8.5a5 5 0 0 1 0 7',
    'M11.5 6a9 9 0 0 1 0 12',
    'M15 3.5a13 13 0 0 1 0 17',
  ];

  private readonly locale = inject(LOCALE_ID);

  protected readonly monthLabel = computed(() => {
    const month = this.analyticsFacade.latestMonth()?.month;
    if (!month) return '';

    const label = new Date(`${month}-01T00:00:00`).toLocaleDateString(this.locale, {
      month: 'long',
      year: 'numeric',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  protected readonly kpis = computed<KpiTile[]>(() => {
    const latest = this.analyticsFacade.latestMonth();
    if (!latest) return [];

    const money = (value: number) => formatMoney(value, latest.currency, this.locale);
    const movements = (count: number) => `${count} ${count === 1 ? 'movimiento' : 'movimientos'}`;

    return [
      {
        key: 'outOfPocket',
        label: 'De mi bolsillo',
        value: money(latest.outOfPocket),
        detail: movements(latest.counts.outOfPocket),
        valueClass: 'text-foreground',
      },
      {
        key: 'credit',
        label: 'Con crédito',
        value: money(latest.credit),
        detail: movements(latest.counts.credit),
        valueClass: 'text-foreground',
      },
      {
        key: 'income',
        label: 'Ingresos',
        value: money(latest.income),
        detail: movements(latest.counts.income),
        valueClass: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        key: 'net',
        label: 'Balance',
        value: `${latest.net > 0 ? '+' : latest.net < 0 ? '−' : ''}${money(Math.abs(latest.net))}`,
        detail: 'Ingresos menos gastos',
        valueClass:
          latest.net > 0
            ? 'text-emerald-600 dark:text-emerald-400'
            : latest.net < 0
              ? 'text-red-600 dark:text-red-400'
              : 'text-muted-foreground',
      },
    ];
  });

  protected readonly cardTiles = computed<CardTile[]>(() => {
    const cards = this.analyticsFacade.cardSpendState().cards;

    return cards.map((card) => ({
      cardId: card.cardId,
      name: card.alias ?? CARD_KIND_LABELS[card.kind],
      kindLabel: CARD_KIND_LABELS[card.kind],
      last4: card.last4,
      total: formatMoney(card.total, card.currency, this.locale),
      detail: `${card.count} ${card.count === 1 ? 'movimiento' : 'movimientos'}`,
      face: faceFor(card.kind, card.alias),
    }));
  });

  constructor() {
    this.analyticsFacade.loadAnalytics();

    effect(() => {
      const month = this.analyticsFacade.latestMonth()?.month;
      if (month) this.analyticsFacade.loadCardSpend(month);
    });
  }
}

const CARD_KIND_LABELS: Record<string, string> = {
  [CardKind.CREDIT]: 'Crédito',
  [CardKind.DEBIT]: 'Débito',
  [CardKind.ACCOUNT]: 'Cuenta',
};

const ARC_PALETTE = ['#f5c518', '#3ab0e2', '#8b5cf6', '#f9a8d4', '#12b886', '#fb923c'];

const arcPath = (radius: number): string => {
  const cx = 6;
  const cy = 250;
  const point = (degrees: number) => {
    const rad = (degrees * Math.PI) / 180;
    return `${(cx + radius * Math.cos(rad)).toFixed(1)} ${(cy + radius * Math.sin(rad)).toFixed(1)}`;
  };
  return `M ${point(-88)} A ${radius} ${radius} 0 0 1 ${point(-18)}`;
};

const bancolombiaArcs = (colors: readonly string[]): CardArc[] =>
  colors.map((color, i) => ({ d: arcPath(150 + i * 17), color, width: 11 }));

const YELLOW_FACE: CardFace = {
  background: 'linear-gradient(135deg, #ffe14d 0%, #f5cf00 100%)',
  ink: '#14120a',
  inkSoft: 'rgba(20, 18, 10, 0.66)',
  chip: 'linear-gradient(135deg, #d9d9d9 0%, #a8a8a8 100%)',
  arcs: bancolombiaArcs(ARC_PALETTE),
  brand: 'mastercard',
};

const WHITE_FACE: CardFace = {
  background: 'linear-gradient(135deg, #ffffff 0%, #e6e6e6 100%)',
  ink: '#15151a',
  inkSoft: 'rgba(21, 21, 26, 0.62)',
  chip: 'linear-gradient(135deg, #d0d0d0 0%, #9a9a9a 100%)',
  arcs: bancolombiaArcs(ARC_PALETTE),
  brand: 'mastercard',
};

const GOLD_FACE: CardFace = {
  background: 'linear-gradient(140deg, #e2c169 0%, #cbaa4e 45%, #b9963f 100%)',
  ink: '#241a06',
  inkSoft: 'rgba(36, 26, 6, 0.7)',
  chip: 'linear-gradient(135deg, #f0d896 0%, #c9a53f 100%)',
  arcs: [],
  brand: 'amex',
};

const ACCOUNT_FACE: CardFace = {
  background: 'linear-gradient(135deg, #35566e 0%, #1b2c3a 100%)',
  ink: '#ffffff',
  inkSoft: 'rgba(255, 255, 255, 0.68)',
  chip: 'linear-gradient(135deg, #d9d9d9 0%, #a8a8a8 100%)',
  arcs: [],
  brand: 'none',
};

const BRAND_FACES: ReadonlyArray<{ match: RegExp; face: CardFace }> = [
  { match: /american\s*express|amex/i, face: GOLD_FACE },
  { match: /d[ée]bito/i, face: YELLOW_FACE },
  { match: /master\s*card|visa|cl[áa]sica/i, face: WHITE_FACE },
];

const faceFor = (kind: string, alias?: string): CardFace => {
  const brand = alias && BRAND_FACES.find((entry) => entry.match.test(alias));
  if (brand) return brand.face;
  return kind === CardKind.ACCOUNT ? ACCOUNT_FACE : WHITE_FACE;
};
