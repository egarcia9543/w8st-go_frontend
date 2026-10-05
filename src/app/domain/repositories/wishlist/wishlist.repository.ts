import { Observable } from 'rxjs';
import {
  Wishlist,
  WishlistItem,
  WishlistItemDraft,
  WishlistStatus,
  WishlistTierSettings,
} from '../../entities/wishlist.entity';

export abstract class WishlistRepository {
  abstract getWishlist(status: WishlistStatus): Observable<Wishlist>;
  abstract createItem(tierId: string, draft: WishlistItemDraft): Observable<WishlistItem>;
  abstract updateItem(id: string, draft: WishlistItemDraft): Observable<WishlistItem>;
  abstract setStatus(id: string, status: WishlistStatus): Observable<WishlistItem>;
  abstract moveItem(id: string, tierId: string, position: number): Observable<void>;
  abstract deleteItem(id: string): Observable<void>;
  abstract updateTier(id: string, settings: WishlistTierSettings): Observable<WishlistTierSettings>;
}
