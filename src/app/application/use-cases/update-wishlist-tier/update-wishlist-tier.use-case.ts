import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WishlistTierSettings } from '../../../domain/entities/wishlist.entity';
import { WishlistRepository } from '../../../domain/repositories/wishlist/wishlist.repository';

@Injectable({ providedIn: 'root' })
export class UpdateWishlistTierUseCase {
  private readonly wishlistRepository = inject(WishlistRepository);

  execute(id: string, settings: WishlistTierSettings): Observable<WishlistTierSettings> {
    return this.wishlistRepository.updateTier(id, settings);
  }
}
