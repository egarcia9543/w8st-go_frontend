import { inject, Injectable, signal } from '@angular/core';
import { finalize, Observable, tap } from 'rxjs';
import { CreateWishlistItemUseCase } from '../../application/use-cases/create-wishlist-item/create-wishlist-item.use-case';
import { DeleteWishlistItemUseCase } from '../../application/use-cases/delete-wishlist-item/delete-wishlist-item.use-case';
import { GetWishlistUseCase } from '../../application/use-cases/get-wishlist/get-wishlist.use-case';
import { MoveWishlistItemUseCase } from '../../application/use-cases/move-wishlist-item/move-wishlist-item.use-case';
import { UpdateWishlistItemUseCase } from '../../application/use-cases/update-wishlist-item/update-wishlist-item.use-case';
import { UpdateWishlistTierUseCase } from '../../application/use-cases/update-wishlist-tier/update-wishlist-tier.use-case';
import {
  Wishlist,
  WishlistItem,
  WishlistItemDraft,
  WishlistStatus,
  WishlistTier,
  WishlistTierSettings,
} from '../../domain/entities/wishlist.entity';

export interface WishlistState {
  wishlist: Wishlist | null;
  loading: boolean;
  error: boolean;
}

const relocate = (
  tiers: WishlistTier[],
  itemId: string,
  toTierId: string,
  toIndex: number,
): WishlistTier[] => {
  const item = tiers.flatMap((tier) => tier.items).find((candidate) => candidate.id === itemId);
  if (!item) return tiers;

  return tiers.map((tier) => {
    const items = tier.items.filter((candidate) => candidate.id !== itemId);
    if (tier.id === toTierId) items.splice(toIndex, 0, { ...item, tierId: toTierId });

    return { ...tier, items: items.map((candidate, position) => ({ ...candidate, position })) };
  });
};

@Injectable({ providedIn: 'root' })
export class WishlistFacade {
  private readonly getWishlistUseCase = inject(GetWishlistUseCase);
  private readonly createItemUseCase = inject(CreateWishlistItemUseCase);
  private readonly updateItemUseCase = inject(UpdateWishlistItemUseCase);
  private readonly moveItemUseCase = inject(MoveWishlistItemUseCase);
  private readonly deleteItemUseCase = inject(DeleteWishlistItemUseCase);
  private readonly updateTierUseCase = inject(UpdateWishlistTierUseCase);

  private readonly _state = signal<WishlistState>({ wishlist: null, loading: false, error: false });
  readonly state = this._state.asReadonly();

  private readonly _status = signal(WishlistStatus.WANTED);
  readonly status = this._status.asReadonly();

  private readonly _busyId = signal<string | null>(null);
  readonly busyId = this._busyId.asReadonly();

  private readonly _actionError = signal<string | null>(null);
  readonly actionError = this._actionError.asReadonly();

  load(status: WishlistStatus = this._status()): void {
    this._status.set(status);
    this._actionError.set(null);
    this._state.update((state) => ({ ...state, loading: true, error: false }));

    this.getWishlistUseCase.execute(status).subscribe({
      next: (wishlist) => this._state.set({ wishlist, loading: false, error: false }),
      error: () => this._state.set({ wishlist: null, loading: false, error: true }),
    });
  }

  createItem(tierId: string, draft: WishlistItemDraft): Observable<WishlistItem> {
    return this.track(
      tierId,
      this.createItemUseCase.execute(tierId, draft).pipe(
        tap((item) =>
          this.patchWishlist((wishlist) => ({
            ...wishlist,
            counts: { ...wishlist.counts, [item.status]: wishlist.counts[item.status] + 1 },
            tiers:
              wishlist.status === item.status
                ? wishlist.tiers.map((tier) =>
                    tier.id === item.tierId ? { ...tier, items: [...tier.items, item] } : tier,
                  )
                : wishlist.tiers,
          })),
        ),
      ),
    );
  }

  updateItem(id: string, draft: WishlistItemDraft): Observable<WishlistItem> {
    return this.track(
      id,
      this.updateItemUseCase.execute(id, draft).pipe(
        tap((updated) =>
          this.patchWishlist((wishlist) => ({
            ...wishlist,
            tiers: wishlist.tiers.map((tier) => ({
              ...tier,
              items: tier.items.map((item) => (item.id === updated.id ? updated : item)),
            })),
          })),
        ),
      ),
    );
  }

  setStatus(item: WishlistItem, status: WishlistStatus): void {
    this.run(item.id, this.updateItemUseCase.setStatus(item.id, status), 'No se pudo actualizar el ítem.', () =>
      this.dropFromView(item, status),
    );
  }

  deleteItem(item: WishlistItem): void {
    this.run(item.id, this.deleteItemUseCase.execute(item.id), 'No se pudo eliminar el ítem.', () =>
      this.dropFromView(item, null),
    );
  }

  moveItem(itemId: string, toTierId: string, toIndex: number): void {
    const snapshot = this._state().wishlist;
    if (!snapshot) return;

    this._actionError.set(null);
    this.patchWishlist((wishlist) => ({
      ...wishlist,
      tiers: relocate(wishlist.tiers, itemId, toTierId, toIndex),
    }));

    this.moveItemUseCase.execute(itemId, toTierId, toIndex).subscribe({
      error: () => {
        this._state.update((state) => ({ ...state, wishlist: snapshot }));
        this._actionError.set('No se pudo mover el ítem. Se restauró el orden anterior.');
      },
    });
  }

  updateTier(id: string, settings: WishlistTierSettings): Observable<WishlistTierSettings> {
    return this.track(
      id,
      this.updateTierUseCase.execute(id, settings).pipe(
        tap((saved) =>
          this.patchWishlist((wishlist) => ({
            ...wishlist,
            tiers: wishlist.tiers.map((tier) => (tier.id === id ? { ...tier, ...saved } : tier)),
          })),
        ),
      ),
    );
  }

  private dropFromView(item: WishlistItem, newStatus: WishlistStatus | null): void {
    this.patchWishlist((wishlist) => {
      const counts = { ...wishlist.counts, [item.status]: wishlist.counts[item.status] - 1 };
      if (newStatus) counts[newStatus] += 1;

      return {
        ...wishlist,
        counts,
        tiers: wishlist.tiers.map((tier) => ({
          ...tier,
          items: tier.items.filter((candidate) => candidate.id !== item.id),
        })),
      };
    });
  }

  private run(id: string, request: Observable<unknown>, errorMessage: string, onSuccess: () => void): void {
    this._actionError.set(null);

    this.track(id, request).subscribe({
      next: () => onSuccess(),
      error: () => this._actionError.set(errorMessage),
    });
  }

  private track<T>(id: string, request: Observable<T>): Observable<T> {
    this._busyId.set(id);
    return request.pipe(finalize(() => this._busyId.set(null)));
  }

  private patchWishlist(change: (wishlist: Wishlist) => Wishlist): void {
    this._state.update((state) =>
      state.wishlist ? { ...state, wishlist: change(state.wishlist) } : state,
    );
  }
}
