import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MonthlyAnalytics } from '../../../domain/entities/analytics.entity';
import { AnalyticsRepository } from '../../../domain/repositories/analytics/analytics.repository';

@Injectable({ providedIn: 'root' })
export class GetAnalyticsUseCase {
  private readonly analyticsRepository = inject(AnalyticsRepository);

  execute(from?: string, to?: string): Observable<MonthlyAnalytics[]> {
    return this.analyticsRepository.getMonthlyAnalytics(from, to);
  }
}
