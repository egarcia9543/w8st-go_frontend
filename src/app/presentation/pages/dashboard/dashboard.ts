import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { SummaryChart } from '../../components/summary-chart/summary-chart';
import { SummaryFacade } from '../../facades/summary.facade';

@Component({
  selector: 'app-dashboard',
  imports: [HlmButton, HlmCardImports, DatePipe, CurrencyPipe, SummaryChart],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly summaryFacade = inject(SummaryFacade);
  protected readonly summaryState = this.summaryFacade.summaryState;

  constructor() {
    this.summaryFacade.loadSummary();
  }
}
