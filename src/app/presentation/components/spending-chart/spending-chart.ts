import { Component, computed, inject, input, LOCALE_ID, signal } from '@angular/core';
import { MonthlyAnalytics } from '../../../domain/entities/analytics.entity';
import { formatMoney } from '../../pipes/format-money';

interface Bar {
  path: string;
  height: number;
}

interface MonthGroup {
  month: string;
  label: string;
  center: number;
  bandX: number;
  bandWidth: number;
  pocket: Bar;
  credit: Bar;
  incomeY: number;
}

interface AxisTick {
  value: number;
  y: number;
  label: string;
}

interface TooltipRow {
  label: string;
  value: string;
  color: string;
}

interface Tooltip {
  title: string;
  rows: TooltipRow[];
  leftPercent: number;
}

const WIDTH = 720;
const HEIGHT = 300;
const PADDING = { top: 16, right: 72, bottom: 36, left: 60 };
const MAX_BAR_WIDTH = 24;
const BAR_GAP = 2;
const TICK_COUNT = 4;

const axisMax = (rawMax: number): number => {
  if (rawMax <= 0) return TICK_COUNT;

  const rough = rawMax / TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= rough) ??
    10 * magnitude;

  return step * TICK_COUNT;
};

@Component({
  selector: 'app-spending-chart',
  templateUrl: './spending-chart.html',
  styleUrl: './spending-chart.scss',
})
export class SpendingChart {
  readonly months = input.required<MonthlyAnalytics[]>();

  private readonly locale = inject(LOCALE_ID);

  protected readonly width = WIDTH;
  protected readonly height = HEIGHT;
  protected readonly baseline = HEIGHT - PADDING.bottom;
  protected readonly plotLeft = PADDING.left;
  protected readonly plotRight = WIDTH - PADDING.right;

  protected readonly hovered = signal<number | null>(null);

  private readonly scaleMax = computed(() => {
    const values = this.months().flatMap((m) => [m.outOfPocket, m.credit, m.income]);
    return axisMax(Math.max(...values, 0));
  });

  private readonly plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  private yFor(value: number): number {
    return PADDING.top + this.plotHeight * (1 - value / this.scaleMax());
  }

  protected readonly ticks = computed<AxisTick[]>(() => {
    const max = this.scaleMax();
    const compact = new Intl.NumberFormat(this.locale, {
      notation: 'compact',
      maximumFractionDigits: 1,
    });

    return Array.from({ length: TICK_COUNT + 1 }, (_, i) => {
      const value = (max / TICK_COUNT) * i;
      return { value, y: this.yFor(value), label: compact.format(value) };
    });
  });

  protected readonly groups = computed<MonthGroup[]>(() => {
    const data = this.months();
    if (data.length === 0) return [];

    const plotWidth = WIDTH - PADDING.left - PADDING.right;
    const band = plotWidth / data.length;
    const barWidth = Math.min(MAX_BAR_WIDTH, (band * 0.62 - BAR_GAP) / 2);

    return data.map((row, i) => {
      const bandX = PADDING.left + i * band;
      const center = bandX + band / 2;
      const pocketX = center - barWidth - BAR_GAP / 2;
      const creditX = center + BAR_GAP / 2;

      return {
        month: row.month,
        label: this.monthLabel(row.month),
        center,
        bandX,
        bandWidth: band,
        pocket: this.barFrom(pocketX, barWidth, row.outOfPocket),
        credit: this.barFrom(creditX, barWidth, row.credit),
        incomeY: this.yFor(row.income),
      };
    });
  });

  protected readonly incomePath = computed(() =>
    this.groups()
      .map((g) => `${g.center},${g.incomeY}`)
      .join(' '),
  );

  protected readonly incomeEnd = computed(() => {
    const data = this.months();
    const groups = this.groups();
    if (groups.length === 0) return null;

    const last = groups[groups.length - 1];
    return {
      x: last.center,
      y: last.incomeY,
      label: formatMoney(data[data.length - 1].income, data[data.length - 1].currency, this.locale),
    };
  });

  protected readonly tooltip = computed<Tooltip | null>(() => {
    const index = this.hovered();
    if (index === null) return null;

    const row = this.months()[index];
    const group = this.groups()[index];
    if (!row || !group) return null;

    const money = (value: number) => formatMoney(value, row.currency, this.locale);

    return {
      title: group.label,
      leftPercent: (group.center / WIDTH) * 100,
      rows: [
        { label: 'De mi bolsillo', value: money(row.outOfPocket), color: 'var(--series-pocket)' },
        { label: 'Con crédito', value: money(row.credit), color: 'var(--series-credit)' },
        { label: 'Ingresos', value: money(row.income), color: 'var(--series-income)' },
      ],
    };
  });

  private barFrom(x: number, width: number, value: number): Bar {
    const y = this.yFor(value);
    const height = Math.max(0, this.baseline - y);
    const radius = Math.min(4, width / 2, height);
    const right = x + width;

    const path = [
      `M ${x} ${this.baseline}`,
      `L ${x} ${y + radius}`,
      `Q ${x} ${y} ${x + radius} ${y}`,
      `L ${right - radius} ${y}`,
      `Q ${right} ${y} ${right} ${y + radius}`,
      `L ${right} ${this.baseline}`,
      'Z',
    ].join(' ');

    return { path, height };
  }

  private monthLabel(month: string): string {
    const label = new Date(`${month}-01T00:00:00`).toLocaleDateString(this.locale, {
      month: 'short',
      year: '2-digit',
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
}
