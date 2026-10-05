export interface WishlistItemDto {
  id: string;
  tierId: string;
  name: string;
  price: number;
  currency: string;
  productUrl: string | null;
  imageUrl: string | null;
  notes: string | null;
  position: number;
  status: string;
  boughtAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistTierDto {
  id: string;
  label: string;
  color: string;
  position: number;
  items: WishlistItemDto[];
}

export interface WishlistDto {
  status: string;
  counts: Record<string, number>;
  tiers: WishlistTierDto[];
}

export interface CreateWishlistItemDto {
  tierId: string;
  name: string;
  price: number;
  currency: string;
  productUrl: string | null;
  imageUrl: string | null;
  notes: string | null;
}

export interface UpdateWishlistItemDto {
  name?: string;
  price?: number;
  currency?: string;
  productUrl?: string | null;
  imageUrl?: string | null;
  notes?: string | null;
  status?: string;
}

export interface MoveWishlistItemDto {
  tierId: string;
  position: number;
}

export interface UpdateWishlistTierDto {
  label?: string;
  color?: string;
}

export type WishlistTierSettingsDto = Omit<WishlistTierDto, 'items'>;
