import { Observable } from 'rxjs';
import { MonthlyAnalytics } from '../../entities/analytics.entity';

export abstract class AnalyticsRepository {
  abstract getMonthlyAnalytics(from?: string, to?: string): Observable<MonthlyAnalytics[]>;
}
