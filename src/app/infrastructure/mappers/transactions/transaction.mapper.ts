import { Transaction } from '../../../domain/entities/transaction.entity';
import { TransactionDto } from '../../models/transaction.dto';

export class TransactionMapper {
  static toDomain(dto: TransactionDto): Transaction {
    return {
      id: dto.id,
      type: dto.type as Transaction['type'],
      amount: dto.amount,
      currency: dto.currency as Transaction['currency'],
      paymentMethod: dto.paymentMethod as Transaction['paymentMethod'],
      merchant: dto.merchant ?? undefined,
      cardLast4: dto.cardLast4 ?? undefined,
      channel: dto.channel ?? undefined,
      recipientName: dto.recipientName ?? undefined,
      recipientKey: dto.recipientKey ?? undefined,
      transactionDate: dto.transactionDate,
    };
  }

  static toDomainList(dtos: TransactionDto[]): Transaction[] {
    return dtos.map((dto) => this.toDomain(dto));
  }
}
