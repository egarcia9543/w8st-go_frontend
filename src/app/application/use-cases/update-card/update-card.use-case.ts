import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Card, CardSettings } from '../../../domain/entities/card.entity';
import { CardsRepository } from '../../../domain/repositories/cards/cards.repository';

@Injectable({ providedIn: 'root' })
export class UpdateCardUseCase {
  private readonly cardsRepository = inject(CardsRepository);

  execute(id: string, changes: Partial<CardSettings>): Observable<Card> {
    return this.cardsRepository.updateCard(id, changes);
  }

  setArchived(id: string, archived: boolean): Observable<Card> {
    return this.cardsRepository.setArchived(id, archived);
  }
}
