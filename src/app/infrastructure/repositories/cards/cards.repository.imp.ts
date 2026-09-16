import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Card, CardSettings } from '../../../domain/entities/card.entity';
import { CardsRepository } from '../../../domain/repositories/cards/cards.repository';
import { CardsApiDatasource } from '../../datasources/cards/cards.api.datasource';
import { CardMapper } from '../../mappers/cards/card.mapper';

@Injectable()
export class CardsRepositoryImp implements CardsRepository {
  private readonly cardsDatasource = inject(CardsApiDatasource);

  getCards(includeArchived = false): Observable<Card[]> {
    return this.cardsDatasource
      .getCards(includeArchived)
      .pipe(map((dtos) => CardMapper.toDomainList(dtos)));
  }

  updateCard(id: string, changes: Partial<CardSettings>): Observable<Card> {
    return this.cardsDatasource
      .updateCard(id, changes)
      .pipe(map((dto) => CardMapper.toDomain(dto)));
  }

  setArchived(id: string, archived: boolean): Observable<Card> {
    return this.cardsDatasource
      .updateCard(id, { archived })
      .pipe(map((dto) => CardMapper.toDomain(dto)));
  }
}
