import { CardSpend, SpendPeriod } from '../../../domain/entities/card-spend.entity';
import { CardSpendDto, SpendPeriodDto } from '../../models/card-spend.dto';

export class CardSpendMapper {
  static toDomain(dto: CardSpendDto): CardSpend {
    return {
      cardId: dto.cardId,
      last4: dto.last4,
      kind: dto.kind as CardSpend['kind'],
      alias: dto.alias ?? undefined,
      cutoffDay: dto.cutoffDay ?? undefined,
      paymentGraceDays: dto.paymentGraceDays ?? undefined,
      creditLimit: dto.creditLimit ?? undefined,
      currency: dto.currency as CardSpend['currency'],
      total: dto.total,
      count: dto.count,
      utilization: dto.utilization ?? undefined,
      period: dto.period ? this.periodToDomain(dto.period) : undefined,
      topMerchants: dto.topMerchants.map((m) => ({ merchant: m.merchant, total: m.total })),
    };
  }

  static toDomainList(dtos: CardSpendDto[]): CardSpend[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  private static periodToDomain(dto: SpendPeriodDto): SpendPeriod {
    return {
      basis: dto.basis as SpendPeriod['basis'],
      label: dto.label,
      from: dto.from,
      to: dto.to,
      closesOn: dto.closesOn ?? undefined,
      paymentDueDate: dto.paymentDueDate ?? undefined,
    };
  }
}
