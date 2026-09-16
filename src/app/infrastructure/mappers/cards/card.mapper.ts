import { BillingCycle, Card } from '../../../domain/entities/card.entity';
import { BillingCycleDto, CardDto } from '../../models/card.dto';

export class CardMapper {
  static toDomain(dto: CardDto): Card {
    return {
      id: dto.id,
      last4: dto.last4,
      kind: dto.kind as Card['kind'],
      alias: dto.alias ?? undefined,
      issuer: dto.issuer ?? undefined,
      cutoffDay: dto.cutoffDay ?? undefined,
      paymentGraceDays: dto.paymentGraceDays ?? undefined,
      creditLimit: dto.creditLimit ?? undefined,
      archived: dto.archived,
      transactionCount: dto.transactionCount,
      currentCycle: dto.currentCycle ? this.cycleToDomain(dto.currentCycle) : undefined,
    };
  }

  static toDomainList(dtos: CardDto[]): Card[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  private static cycleToDomain(dto: BillingCycleDto): BillingCycle {
    return {
      label: dto.label,
      from: dto.from,
      to: dto.to,
      closesOn: dto.closesOn ?? undefined,
      paymentDueDate: dto.paymentDueDate ?? undefined,
    };
  }
}
