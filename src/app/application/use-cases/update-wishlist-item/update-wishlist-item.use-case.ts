import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  WishlistItem,
  WishlistItemDraft,
  WishlistStatus,
} from '../../../domain/entities/wishlist.entity';
import { WishlistRepository } from '../../../domain/repositories/wishlist/wishlist.repository';

@Injectable({ providedIn: 'root' })
export class UpdateWishlistItemUseCase {
  private readonly wishlistRepository = inject(WishlistRepository);

  execute(id: string, draft: WishlistItemDraft): Observable<WishlistItem> {
    return this.wishlistRepository.updateItem(id, draft);
  }

  setStatus(id: string, status: WishlistStatus): Observable<WishlistItem> {
    return this.wishlistRepository.setStatus(id, status);
  }
}
