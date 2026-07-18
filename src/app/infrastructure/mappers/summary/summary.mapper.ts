import { Summary } from '../../../domain/entities/summary.entity';
import { SummaryDto } from '../../models/summary.dto';

export class SummaryMapper {
  static toDomain(dto: SummaryDto): Summary {
    return {
      month: dto.month,
      total: dto.total,
      count: dto.count,
    };
  }

  static toDomainList(dtos: SummaryDto[]): Summary[] {
    return dtos.map((d) => this.toDomain(d));
  }
}
