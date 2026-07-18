import { inject, Injectable } from '@angular/core';
import { TransactionsRepository } from '../../../domain/repositories/transactions/transactions.repository';
import { Observable } from 'rxjs';
import { Summary } from '../../../domain/entities/summary.entity';

@Injectable({ providedIn: 'root' })
export class GetSummaryUseCase {
  private readonly transactionsRepository = inject(TransactionsRepository);

  execute(): Observable<Summary[]> {
    return this.transactionsRepository.getSummary();
  }
}
