import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CardSpend } from '../../../domain/entities/card-spend.entity';
import { AnalyticsRepository } from '../../../domain/repositories/analytics/analytics.repository';

@Injectable({ providedIn: 'root' })
export class GetCardSpendUseCase {
  private readonly analyticsRepository = inject(AnalyticsRepository);

  execute(month?: string): Observable<CardSpend[]> {
    return this.analyticsRepository.getCardSpend(month);
  }
}
