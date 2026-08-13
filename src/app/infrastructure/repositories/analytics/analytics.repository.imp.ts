import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MonthlyAnalytics } from '../../../domain/entities/analytics.entity';
import { AnalyticsRepository } from '../../../domain/repositories/analytics/analytics.repository';
import { AnalyticsApiDatasource } from '../../datasources/analytics/analytics.api.datasource';
import { AnalyticsMapper } from '../../mappers/analytics/analytics.mapper';

@Injectable()
export class AnalyticsRepositoryImp implements AnalyticsRepository {
  private readonly analyticsDatasource = inject(AnalyticsApiDatasource);

  getMonthlyAnalytics(from?: string, to?: string): Observable<MonthlyAnalytics[]> {
    return this.analyticsDatasource
      .getMonthlyAnalytics(from, to)
      .pipe(map((dtos) => AnalyticsMapper.toDomainList(dtos)));
  }
}
