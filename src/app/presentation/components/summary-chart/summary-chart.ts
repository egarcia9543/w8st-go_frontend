import { Component, computed, input, signal } from '@angular/core';
import { Summary } from '../../../domain/entities/summary.entity';
import { CurrencyPipe, DatePipe } from '@angular/common';

interface Bar {
  x: number;
  y: number;
  width: number;
  height: number;
  month: string;
  total: number;
  count: number;
}

@Component({
  selector: 'app-summary-chart',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './summary-chart.html',
  styleUrl: './summary-chart.scss',
})
export class SummaryChart {
  readonly summaries = input.required<Summary[]>();
  protected readonly hovered = signal<number | null>(null);

  protected readonly width = 600;
  protected readonly height = 260;
  private readonly pad = { top: 24, right: 16, bottom: 32, left: 16 };
  protected readonly baseline = this.height - this.pad.bottom;

  protected readonly bars = computed<Bar[]>(() => {
    const data = this.summaries();
    if (data.length === 0) return [];
    const max = Math.max(...data.map((d) => d.total), 1);
    const chartW = this.width - this.pad.left - this.pad.right;
    const chartH = this.height - this.pad.top - this.pad.bottom;
    const slot = chartW / data.length;
    const barW = slot * 0.6;
    return data.map((d, i) => {
      const h = (d.total / max) * chartH;
      return {
        x: this.pad.left + i * slot + (slot - barW) / 2,
        y: this.pad.top + (chartH - h),
        width: barW,
        height: h,
        month: d.month,
        total: d.total,
        count: d.count,
      };
    });
  });

  protected readonly tooltip = computed(() => {
    const i = this.hovered();
    if (i === null) return null;
    const b = this.bars()[i];
    if (!b) return null;

    const halfW = 62;
    const tipH = 42;
    const cx = Math.min(Math.max(b.x + b.width / 2, halfW + 2), this.width - halfW - 2);
    const cy = Math.max(b.y, tipH + 4);
    return { cx, cy, total: b.total, count: b.count };
  });
}
