import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Card } from '../../../domain/entities/card.entity';
import { CardsRepository } from '../../../domain/repositories/cards/cards.repository';

@Injectable({ providedIn: 'root' })
export class GetCardsUseCase {
  private readonly cardsRepository = inject(CardsRepository);

  execute(includeArchived = false): Observable<Card[]> {
    return this.cardsRepository.getCards(includeArchived);
  }
}
