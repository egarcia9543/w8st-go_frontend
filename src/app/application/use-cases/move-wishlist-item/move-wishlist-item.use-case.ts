import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WishlistRepository } from '../../../domain/repositories/wishlist/wishlist.repository';

@Injectable({ providedIn: 'root' })
export class MoveWishlistItemUseCase {
  private readonly wishlistRepository = inject(WishlistRepository);

  execute(id: string, tierId: string, position: number): Observable<void> {
    return this.wishlistRepository.moveItem(id, tierId, position);
  }
}
