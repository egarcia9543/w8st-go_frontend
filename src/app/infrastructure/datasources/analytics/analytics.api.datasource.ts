import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MonthlyAnalyticsDto } from '../../models/analytics.dto';

@Injectable({ providedIn: 'root' })
export class AnalyticsApiDatasource {
  private readonly http = inject(HttpClient);

  getMonthlyAnalytics(from?: string, to?: string): Observable<MonthlyAnalyticsDto[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);

    return this.http.get<MonthlyAnalyticsDto[]>(`${environment.apiUrl}/analytics/summary`, {
      params,
    });
  }
}
