import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Debt, DebtDraft, DebtPlan } from '../../../domain/entities/debt.entity';
import { DebtsRepository } from '../../../domain/repositories/debts/debts.repository';
import { DebtsApiDatasource } from '../../datasources/debts/debts.api.datasource';
import { DebtMapper } from '../../mappers/debts/debt.mapper';

@Injectable()
export class DebtsRepositoryImp implements DebtsRepository {
  private readonly debtsDatasource = inject(DebtsApiDatasource);

  getDebts(includeArchived = false): Observable<Debt[]> {
    return this.debtsDatasource
      .getDebts(includeArchived)
      .pipe(map((dtos) => DebtMapper.toDomainList(dtos)));
  }

  createDebt(draft: DebtDraft): Observable<Debt> {
    return this.debtsDatasource.createDebt(draft).pipe(map((dto) => DebtMapper.toDomain(dto)));
  }

  updateDebt(id: string, draft: Partial<DebtDraft>): Observable<Debt> {
    return this.debtsDatasource.updateDebt(id, draft).pipe(map((dto) => DebtMapper.toDomain(dto)));
  }

  setDebtArchived(id: string, archived: boolean): Observable<Debt> {
    return this.debtsDatasource
      .updateDebt(id, { archived })
      .pipe(map((dto) => DebtMapper.toDomain(dto)));
  }

  registerPayment(id: string, amount: number): Observable<Debt> {
    return this.debtsDatasource
      .registerPayment(id, { amount })
      .pipe(map((dto) => DebtMapper.toDomain(dto)));
  }

  getPlan(extraPerMonth: number): Observable<DebtPlan> {
    return this.debtsDatasource
      .getPlan(extraPerMonth)
      .pipe(map((dto) => DebtMapper.planToDomain(dto)));
  }
}
