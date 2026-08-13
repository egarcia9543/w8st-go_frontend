import { MonthlyAnalytics } from '../../../domain/entities/analytics.entity';
import { MonthlyAnalyticsDto } from '../../models/analytics.dto';

export class AnalyticsMapper {
  static toDomain(dto: MonthlyAnalyticsDto): MonthlyAnalytics {
    return {
      month: dto.month,
      currency: dto.currency as MonthlyAnalytics['currency'],
      outOfPocket: dto.outOfPocket,
      credit: dto.credit,
      income: dto.income,
      internal: dto.internal,
      net: dto.net,
      counts: {
        outOfPocket: dto.counts.outOfPocket,
        credit: dto.counts.credit,
        income: dto.counts.income,
        internal: dto.counts.internal,
      },
    };
  }

  static toDomainList(dtos: MonthlyAnalyticsDto[]): MonthlyAnalytics[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
