import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WishlistItem, WishlistItemDraft } from '../../../domain/entities/wishlist.entity';
import { WishlistRepository } from '../../../domain/repositories/wishlist/wishlist.repository';

@Injectable({ providedIn: 'root' })
export class CreateWishlistItemUseCase {
  private readonly wishlistRepository = inject(WishlistRepository);

  execute(tierId: string, draft: WishlistItemDraft): Observable<WishlistItem> {
    return this.wishlistRepository.createItem(tierId, draft);
  }
}
