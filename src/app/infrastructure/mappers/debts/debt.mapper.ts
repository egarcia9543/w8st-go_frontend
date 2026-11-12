import {
  Debt,
  DebtKind,
  DebtPayoff,
  DebtPlan,
  DebtStrategy,
} from '../../../domain/entities/debt.entity';
import { DebtDto, DebtPayoffDto, DebtPlanDto } from '../../models/debt.dto';

export class DebtMapper {
  static toDomain(dto: DebtDto): Debt {
    return {
      id: dto.id,
      name: dto.name,
      kind: dto.kind as DebtKind,
      balance: dto.balance,
      annualRate: dto.annualRate,
      monthlyPayment: dto.monthlyPayment,
      dueDay: dto.dueDay ?? undefined,
      paidByOther: dto.paidByOther,
      notes: dto.notes ?? undefined,
      archived: dto.archived,
      updatedAt: dto.updatedAt,
      recentPayments: (dto.recentPayments ?? []).map((payment) => ({
        amount: payment.amount,
        paidAt: payment.paidAt,
      })),
    };
  }

  static toDomainList(dtos: DebtDto[]): Debt[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  static planToDomain(dto: DebtPlanDto): DebtPlan {
    return {
      strategy: dto.strategy as DebtStrategy,
      startMonth: dto.startMonth,
      extraPerMonth: dto.extraPerMonth,
      monthlyPayment: dto.monthlyPayment,
      totalBalance: dto.totalBalance,
      totalInterest: dto.totalInterest,
      debtFreeMonth: dto.debtFreeMonth ?? undefined,
      debts: dto.debts.map((row) => this.payoffToDomain(row)),
      paidByOther: dto.paidByOther.map((row) => this.payoffToDomain(row)),
    };
  }

  private static payoffToDomain(dto: DebtPayoffDto): DebtPayoff {
    return {
      id: dto.id,
      name: dto.name,
      order: dto.order,
      annualRate: dto.annualRate,
      balance: dto.balance,
      receivesExtra: dto.receivesExtra,
      payoffMonth: dto.payoffMonth ?? undefined,
      months: dto.months ?? undefined,
      interestPaid: dto.interestPaid,
    };
  }
}
