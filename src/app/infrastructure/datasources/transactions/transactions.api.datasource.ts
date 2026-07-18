import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, timeout } from 'rxjs';
import { TransactionDto } from '../../models/transaction.dto';
import { SyncDto } from '../../models/sync.dto';

@Injectable({ providedIn: 'root' })
export class TransactionsApiDatasource {
  private readonly http = inject(HttpClient);

  getTransactions(month?: string): Observable<TransactionDto[]> {
    const options = month ? { params: new HttpParams().set('month', month) } : {};
    return this.http.get<TransactionDto[]>(`${environment.apiUrl}/transactions`, options);
  }

  syncTransactions(): Observable<SyncDto> {
    return this.http.post<SyncDto>(`${environment.apiUrl}/sync`, {}).pipe(timeout(60_000));
  }
}
