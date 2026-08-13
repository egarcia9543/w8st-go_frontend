import { Observable } from 'rxjs';
import { MonthlyAnalytics } from '../../entities/analytics.entity';
import { CardSpend } from '../../entities/card-spend.entity';

export abstract class AnalyticsRepository {
  abstract getMonthlyAnalytics(from?: string, to?: string): Observable<MonthlyAnalytics[]>;
  abstract getCardSpend(month?: string): Observable<CardSpend[]>;
}
