import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  Wishlist,
  WishlistItem,
  WishlistItemDraft,
  WishlistStatus,
  WishlistTierSettings,
} from '../../../domain/entities/wishlist.entity';
import { WishlistRepository } from '../../../domain/repositories/wishlist/wishlist.repository';
import { WishlistApiDatasource } from '../../datasources/wishlist/wishlist.api.datasource';
import { WishlistMapper } from '../../mappers/wishlist/wishlist.mapper';

@Injectable()
export class WishlistRepositoryImp implements WishlistRepository {
  private readonly wishlistDatasource = inject(WishlistApiDatasource);

  getWishlist(status: WishlistStatus): Observable<Wishlist> {
    return this.wishlistDatasource
      .getWishlist(status)
      .pipe(map((dto) => WishlistMapper.toDomain(dto)));
  }

  createItem(tierId: string, draft: WishlistItemDraft): Observable<WishlistItem> {
    return this.wishlistDatasource
      .createItem({ tierId, ...draft })
      .pipe(map((dto) => WishlistMapper.itemToDomain(dto)));
  }

  updateItem(id: string, draft: WishlistItemDraft): Observable<WishlistItem> {
    return this.wishlistDatasource
      .updateItem(id, draft)
      .pipe(map((dto) => WishlistMapper.itemToDomain(dto)));
  }

  setStatus(id: string, status: WishlistStatus): Observable<WishlistItem> {
    return this.wishlistDatasource
      .updateItem(id, { status })
      .pipe(map((dto) => WishlistMapper.itemToDomain(dto)));
  }

  moveItem(id: string, tierId: string, position: number): Observable<void> {
    return this.wishlistDatasource.moveItem(id, { tierId, position });
  }

  deleteItem(id: string): Observable<void> {
    return this.wishlistDatasource.deleteItem(id);
  }

  updateTier(id: string, settings: WishlistTierSettings): Observable<WishlistTierSettings> {
    return this.wishlistDatasource
      .updateTier(id, settings)
      .pipe(map((dto) => ({ label: dto.label, color: dto.color })));
  }
}
