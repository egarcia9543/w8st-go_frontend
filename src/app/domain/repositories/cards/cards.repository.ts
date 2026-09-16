import { Observable } from 'rxjs';
import { Card, CardSettings } from '../../entities/card.entity';

export abstract class CardsRepository {
  abstract getCards(includeArchived?: boolean): Observable<Card[]>;
  abstract updateCard(id: string, changes: Partial<CardSettings>): Observable<Card>;
  abstract setArchived(id: string, archived: boolean): Observable<Card>;
}
