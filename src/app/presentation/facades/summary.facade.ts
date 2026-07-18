import { inject, Injectable, signal } from '@angular/core';
import { GetSummaryUseCase } from '../../application/use-cases/get-summary/get-summary.use-case';
import { Summary } from '../../domain/entities/summary.entity';

export interface SummaryState {
  summary: Summary[];
  loading: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class SummaryFacade {
  private readonly getSummaryUC = inject(GetSummaryUseCase);

  private readonly initialState: SummaryState = { summary: [], loading: false, error: false };
  private readonly _summaryState = signal<SummaryState>({ ...this.initialState });
  readonly summaryState = this._summaryState.asReadonly();

  loadSummary(): void {
    this._summaryState.set({ summary: [], loading: true, error: false });
    this.getSummaryUC.execute().subscribe({
      next: (res) => this._summaryState.set({ summary: res, loading: false, error: false }),
      error: () => this._summaryState.set({ summary: [], loading: false, error: true }),
    });
  }
}
