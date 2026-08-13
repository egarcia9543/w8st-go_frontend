import { CardSpend } from '../../../domain/entities/card-spend.entity';
import { CardSpendDto } from '../../models/card-spend.dto';

export class CardSpendMapper {
  static toDomain(dto: CardSpendDto): CardSpend {
    return {
      cardId: dto.cardId,
      last4: dto.last4,
      kind: dto.kind as CardSpend['kind'],
      alias: dto.alias ?? undefined,
      currency: dto.currency as CardSpend['currency'],
      total: dto.total,
      count: dto.count,
      topMerchants: dto.topMerchants.map((m) => ({ merchant: m.merchant, total: m.total })),
    };
  }

  static toDomainList(dtos: CardSpendDto[]): CardSpend[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
