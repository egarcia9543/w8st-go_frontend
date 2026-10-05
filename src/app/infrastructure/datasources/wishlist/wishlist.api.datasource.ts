import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateWishlistItemDto,
  MoveWishlistItemDto,
  UpdateWishlistItemDto,
  UpdateWishlistTierDto,
  WishlistDto,
  WishlistItemDto,
  WishlistTierSettingsDto,
} from '../../models/wishlist.dto';

@Injectable({ providedIn: 'root' })
export class WishlistApiDatasource {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/wishlist`;

  getWishlist(status: string): Observable<WishlistDto> {
    return this.http.get<WishlistDto>(this.baseUrl, {
      params: new HttpParams().set('status', status),
    });
  }

  createItem(item: CreateWishlistItemDto): Observable<WishlistItemDto> {
    return this.http.post<WishlistItemDto>(`${this.baseUrl}/items`, item);
  }

  updateItem(id: string, changes: UpdateWishlistItemDto): Observable<WishlistItemDto> {
    return this.http.patch<WishlistItemDto>(`${this.baseUrl}/items/${id}`, changes);
  }

  moveItem(id: string, target: MoveWishlistItemDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/items/${id}/position`, target);
  }

  deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${id}`);
  }

  updateTier(id: string, changes: UpdateWishlistTierDto): Observable<WishlistTierSettingsDto> {
    return this.http.patch<WishlistTierSettingsDto>(`${this.baseUrl}/tiers/${id}`, changes);
  }
}
