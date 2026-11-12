import { Debt, DebtKind, DebtPayoff, DebtPlan } from '../../../domain/entities/debt.entity';
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
      paidByOther: dto.paidByOther,
      notes: dto.notes ?? undefined,
      archived: dto.archived,
      updatedAt: dto.updatedAt,
    };
  }

  static toDomainList(dtos: DebtDto[]): Debt[] {
    return dtos.map((dto) => this.toDomain(dto));
  }

  static planToDomain(dto: DebtPlanDto): DebtPlan {
    return {
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
      payoffMonth: dto.payoffMonth ?? undefined,
      months: dto.months ?? undefined,
      interestPaid: dto.interestPaid,
    };
  }
}
