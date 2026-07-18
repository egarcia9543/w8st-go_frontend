import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { TransactionDto } from '../../models/transaction.dto';

@Injectable({ providedIn: 'root' })
export class TransactionsApiDatasource {
  private readonly http = inject(HttpClient);

  getTransactions(): Observable<TransactionDto[]> {
    return this.http.get<TransactionDto[]>(`${environment.apiUrl}/transactions`);
  }
}
