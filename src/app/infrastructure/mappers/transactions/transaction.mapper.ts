import {
  Direction,
  FundingSource,
  Transaction,
  TransactionCard,
} from '../../../domain/entities/transaction.entity';
import { TransactionCardDto, TransactionDto } from '../../models/transaction.dto';

export class TransactionMapper {
  static toDomain(dto: TransactionDto): Transaction {
    return {
      id: dto.id,
      type: dto.type as Transaction['type'],
      amount: dto.amount,
      currency: dto.currency as Transaction['currency'],
      direction: (dto.direction as Direction) ?? Direction.OUTFLOW,
      fundingSource: (dto.fundingSource as FundingSource) ?? FundingSource.OWN_FUNDS,
      paymentMethod: dto.paymentMethod as Transaction['paymentMethod'],
      merchant: dto.merchant ?? undefined,
      instrumentLast4: dto.instrumentLast4 ?? undefined,
      channel: dto.channel ?? undefined,
      counterpartyName: dto.counterpartyName ?? undefined,
      counterpartyKey: dto.counterpartyKey ?? undefined,
      card: dto.card ? this.cardToDomain(dto.card) : undefined,
      excludeFromSpending: dto.excludeFromSpending ?? false,
      transactionDate: dto.transactionDate,
    };
  }

  private static cardToDomain(dto: TransactionCardDto): TransactionCard {
    return {
      id: dto.id,
      last4: dto.last4,
      kind: dto.kind as TransactionCard['kind'],
      alias: dto.alias ?? undefined,
    };
  }

  static toDomainList(dtos: TransactionDto[]): Transaction[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
