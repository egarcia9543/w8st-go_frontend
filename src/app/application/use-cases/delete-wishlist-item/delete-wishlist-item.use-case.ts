import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WishlistRepository } from '../../../domain/repositories/wishlist/wishlist.repository';

@Injectable({ providedIn: 'root' })
export class DeleteWishlistItemUseCase {
  private readonly wishlistRepository = inject(WishlistRepository);

  execute(id: string): Observable<void> {
    return this.wishlistRepository.deleteItem(id);
  }
}
