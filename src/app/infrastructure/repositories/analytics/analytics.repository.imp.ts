import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MonthlyAnalytics } from '../../../domain/entities/analytics.entity';
import { AnalyticsRepository } from '../../../domain/repositories/analytics/analytics.repository';
import { AnalyticsApiDatasource } from '../../datasources/analytics/analytics.api.datasource';
import { CardSpend } from '../../../domain/entities/card-spend.entity';
import { AnalyticsMapper } from '../../mappers/analytics/analytics.mapper';
import { CardSpendMapper } from '../../mappers/analytics/card-spend.mapper';

@Injectable()
export class AnalyticsRepositoryImp implements AnalyticsRepository {
  private readonly analyticsDatasource = inject(AnalyticsApiDatasource);

  getMonthlyAnalytics(from?: string, to?: string): Observable<MonthlyAnalytics[]> {
    return this.analyticsDatasource
      .getMonthlyAnalytics(from, to)
      .pipe(map((dtos) => AnalyticsMapper.toDomainList(dtos)));
  }

  getCardSpend(month?: string): Observable<CardSpend[]> {
    return this.analyticsDatasource
      .getCardSpend(month)
      .pipe(map((dtos) => CardSpendMapper.toDomainList(dtos)));
  }
}
