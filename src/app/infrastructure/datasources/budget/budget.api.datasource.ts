import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BudgetSummaryDto, ReferenceIncomeDto } from '../../models/budget.dto';

@Injectable({ providedIn: 'root' })
export class BudgetApiDatasource {
  private readonly http = inject(HttpClient);

  getSummary(month: string): Observable<BudgetSummaryDto> {
    return this.http.get<BudgetSummaryDto>(`${environment.apiUrl}/budget/summary`, {
      params: new HttpParams().set('month', month),
    });
  }

  getReferenceIncomes(): Observable<ReferenceIncomeDto[]> {
    return this.http.get<ReferenceIncomeDto[]>(`${environment.apiUrl}/reference-income`);
  }

  saveReferenceIncome(effectiveFrom: string, amount: number): Observable<ReferenceIncomeDto> {
    return this.http.put<ReferenceIncomeDto>(
      `${environment.apiUrl}/reference-income/${effectiveFrom}`,
      { amount },
    );
  }

  deleteReferenceIncome(effectiveFrom: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/reference-income/${effectiveFrom}`);
  }
}
