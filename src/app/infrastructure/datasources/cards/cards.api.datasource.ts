import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CardDto, UpdateCardDto } from '../../models/card.dto';

@Injectable({ providedIn: 'root' })
export class CardsApiDatasource {
  private readonly http = inject(HttpClient);

  getCards(includeArchived = false): Observable<CardDto[]> {
    const options = includeArchived
      ? { params: new HttpParams().set('includeArchived', 'true') }
      : {};

    return this.http.get<CardDto[]>(`${environment.apiUrl}/cards`, options);
  }

  updateCard(id: string, changes: UpdateCardDto): Observable<CardDto> {
    return this.http.patch<CardDto>(`${environment.apiUrl}/cards/${id}`, changes);
  }
}
