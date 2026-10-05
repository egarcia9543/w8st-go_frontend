import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable, timeout } from 'rxjs';
import {
  CategorizeTransactionsDto,
  CategorizeTransactionsResultDto,
  TransactionDto,
  UncategorizedCountDto,
} from '../../models/transaction.dto';
import { SyncDto } from '../../models/sync.dto';

@Injectable({ providedIn: 'root' })
export class TransactionsApiDatasource {
  private readonly http = inject(HttpClient);

  getTransactions(month?: string): Observable<TransactionDto[]> {
    const options = month ? { params: new HttpParams().set('month', month) } : {};
    return this.http.get<TransactionDto[]>(`${environment.apiUrl}/transactions`, options);
  }

  categorize(id: string, categoryId: string | null): Observable<TransactionDto> {
    return this.http.patch<TransactionDto>(`${environment.apiUrl}/transactions/${id}`, {
      categoryId,
    });
  }

  categorizeMany(body: CategorizeTransactionsDto): Observable<CategorizeTransactionsResultDto> {
    return this.http.patch<CategorizeTransactionsResultDto>(
      `${environment.apiUrl}/transactions/category`,
      body,
    );
  }

  getUncategorizedCount(month?: string): Observable<UncategorizedCountDto> {
    const options = month ? { params: new HttpParams().set('month', month) } : {};
    return this.http.get<UncategorizedCountDto>(
      `${environment.apiUrl}/transactions/uncategorized-count`,
      options,
    );
  }

  syncTransactions(): Observable<SyncDto> {
    return this.http.post<SyncDto>(`${environment.apiUrl}/sync`, {}).pipe(timeout(60_000));
  }

}
