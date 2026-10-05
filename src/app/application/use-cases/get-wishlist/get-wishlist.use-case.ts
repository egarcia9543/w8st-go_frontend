import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Wishlist, WishlistStatus } from '../../../domain/entities/wishlist.entity';
import { WishlistRepository } from '../../../domain/repositories/wishlist/wishlist.repository';

@Injectable({ providedIn: 'root' })
export class GetWishlistUseCase {
  private readonly wishlistRepository = inject(WishlistRepository);

  execute(status: WishlistStatus): Observable<Wishlist> {
    return this.wishlistRepository.getWishlist(status);
  }
}
