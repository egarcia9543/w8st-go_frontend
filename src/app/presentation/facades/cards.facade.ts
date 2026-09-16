import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { GetCardsUseCase } from '../../application/use-cases/get-cards/get-cards.use-case';
import { UpdateCardUseCase } from '../../application/use-cases/update-card/update-card.use-case';
import { Card, CardSettings } from '../../domain/entities/card.entity';
import { CardKind } from '../../domain/entities/transaction.entity';

export interface CardsState {
  cards: Card[];
  loading: boolean;
  error: boolean;
}

@Injectable({ providedIn: 'root' })
export class CardsFacade {
  private readonly getCardsUseCase = inject(GetCardsUseCase);
  private readonly updateCardUseCase = inject(UpdateCardUseCase);

  private readonly _cardsState = signal<CardsState>({ cards: [], loading: false, error: false });
  readonly cardsState = this._cardsState.asReadonly();

  private readonly _savingCardId = signal<string | null>(null);
  readonly savingCardId = this._savingCardId.asReadonly();

  private readonly creditOnly = computed(() =>
    this._cardsState().cards.filter((card) => card.kind === CardKind.CREDIT),
  );

  readonly creditCards = computed(() => this.creditOnly().filter((card) => !card.archived));
  readonly archivedCards = computed(() => this.creditOnly().filter((card) => card.archived));

  readonly needsSetup = computed(() =>
    this.creditCards().filter((card) => card.cutoffDay === undefined),
  );

  loadCards(): void {
    this._cardsState.set({ cards: [], loading: true, error: false });

    this.getCardsUseCase.execute(true).subscribe({
      next: (cards) => this._cardsState.set({ cards, loading: false, error: false }),
      error: () => this._cardsState.set({ cards: [], loading: false, error: true }),
    });
  }

  updateCard(id: string, changes: Partial<CardSettings>): Observable<Card> {
    this._savingCardId.set(id);

    return this.updateCardUseCase.execute(id, changes).pipe(tap({
      next: (card) => this.replaceCard(card),
      finalize: () => this._savingCardId.set(null),
    }));
  }

  setArchived(id: string, archived: boolean): Observable<Card> {
    this._savingCardId.set(id);

    return this.updateCardUseCase.setArchived(id, archived).pipe(tap({
      next: (card) => this.replaceCard(card),
      finalize: () => this._savingCardId.set(null),
    }));
  }

  private replaceCard(updated: Card): void {
    this._cardsState.update((state) => ({
      ...state,
      cards: state.cards.map((card) => (card.id === updated.id ? updated : card)),
    }));
  }
}
