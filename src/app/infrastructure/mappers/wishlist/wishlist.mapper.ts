import { Currency } from '../../../domain/entities/transaction.entity';
import {
  Wishlist,
  WishlistItem,
  WishlistStatus,
  WishlistTier,
} from '../../../domain/entities/wishlist.entity';
import { WishlistDto, WishlistItemDto, WishlistTierDto } from '../../models/wishlist.dto';

export class WishlistMapper {
  static toDomain(dto: WishlistDto): Wishlist {
    return {
      status: dto.status as WishlistStatus,
      counts: {
        [WishlistStatus.WANTED]: dto.counts[WishlistStatus.WANTED] ?? 0,
        [WishlistStatus.BOUGHT]: dto.counts[WishlistStatus.BOUGHT] ?? 0,
        [WishlistStatus.DISCARDED]: dto.counts[WishlistStatus.DISCARDED] ?? 0,
      },
      tiers: dto.tiers.map((tier) => this.tierToDomain(tier)),
    };
  }

  static tierToDomain(dto: WishlistTierDto): WishlistTier {
    return {
      id: dto.id,
      label: dto.label,
      color: dto.color,
      position: dto.position,
      items: dto.items.map((item) => this.itemToDomain(item)),
    };
  }

  static itemToDomain(dto: WishlistItemDto): WishlistItem {
    return {
      id: dto.id,
      tierId: dto.tierId,
      name: dto.name,
      price: dto.price,
      currency: dto.currency as Currency,
      productUrl: dto.productUrl ?? undefined,
      imageUrl: dto.imageUrl ?? undefined,
      notes: dto.notes ?? undefined,
      position: dto.position,
      status: dto.status as WishlistStatus,
      boughtAt: dto.boughtAt ?? undefined,
      createdAt: dto.createdAt,
    };
  }
}
