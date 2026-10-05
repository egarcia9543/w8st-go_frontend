import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-budget-bar',
  template: `
    <div class="relative h-2 rounded-full bg-muted" [class.h-3]="size() === 'lg'">
      <div
        class="h-full rounded-full transition-[width] duration-500"
        [class]="barClass()"
        [style.width.%]="width()"
      ></div>
      @if (marker() !== null) {
        <div
          class="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-foreground/60"
          [style.left.%]="marker()"
          title="Avance del mes"
        ></div>
      }
    </div>
  `,
})
export class BudgetBar {
  readonly fill = input.required<number>();
  readonly barClass = input('bg-primary');
  readonly marker = input<number | null>(null);
  readonly size = input<'md' | 'lg'>('md');

  protected readonly width = computed(() => Math.min(Math.max(this.fill(), 0), 100));
}
