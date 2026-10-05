import { Currency } from './transaction.entity';

export enum WishlistStatus {
  WANTED = 'WANTED',
  BOUGHT = 'BOUGHT',
  DISCARDED = 'DISCARDED',
}

export interface WishlistItem {
  id: string;
  tierId: string;
  name: string;
  price: number;
  currency: Currency;
  productUrl?: string;
  imageUrl?: string;
  notes?: string;
  position: number;
  status: WishlistStatus;
  boughtAt?: string;
  createdAt: string;
}

export interface WishlistTier {
  id: string;
  label: string;
  color: string;
  position: number;
  items: WishlistItem[];
}

export interface Wishlist {
  status: WishlistStatus;
  counts: Record<WishlistStatus, number>;
  tiers: WishlistTier[];
}

export interface WishlistItemDraft {
  name: string;
  price: number;
  currency: Currency;
  productUrl: string | null;
  imageUrl: string | null;
  notes: string | null;
}

export interface WishlistTierSettings {
  label: string;
  color: string;
}

export const WISHLIST_TIER_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
  '#ec4899',
  '#64748b',
] as const;

export const IMPULSE_COOLDOWN_DAYS = 30;
