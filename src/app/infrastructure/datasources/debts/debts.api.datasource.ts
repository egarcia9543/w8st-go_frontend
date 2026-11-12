import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DebtDto, DebtPaymentDto, DebtPlanDto, SaveDebtDto } from '../../models/debt.dto';

@Injectable({ providedIn: 'root' })
export class DebtsApiDatasource {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/debts`;

  getDebts(includeArchived = false): Observable<DebtDto[]> {
    const options = includeArchived
      ? { params: new HttpParams().set('includeArchived', 'true') }
      : {};

    return this.http.get<DebtDto[]>(this.baseUrl, options);
  }

  createDebt(debt: SaveDebtDto): Observable<DebtDto> {
    return this.http.post<DebtDto>(this.baseUrl, debt);
  }

  updateDebt(id: string, changes: SaveDebtDto): Observable<DebtDto> {
    return this.http.patch<DebtDto>(`${this.baseUrl}/${id}`, changes);
  }

  registerPayment(id: string, payment: DebtPaymentDto): Observable<DebtDto> {
    return this.http.post<DebtDto>(`${this.baseUrl}/${id}/payments`, payment);
  }

  getPlan(extra: number): Observable<DebtPlanDto> {
    return this.http.get<DebtPlanDto>(`${this.baseUrl}/plan`, {
      params: new HttpParams().set('extra', String(extra)),
    });
  }
}
