import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  BudgetGroupSettingsDto,
  CategoryCatalogDto,
  CategoryDto,
  SaveBudgetGroupDto,
  SaveCategoryDto,
} from '../../models/category.dto';

@Injectable({ providedIn: 'root' })
export class CategoriesApiDatasource {
  private readonly http = inject(HttpClient);

  getCatalog(includeArchived = false): Observable<CategoryCatalogDto> {
    const options = includeArchived
      ? { params: new HttpParams().set('includeArchived', 'true') }
      : {};
    return this.http.get<CategoryCatalogDto>(`${environment.apiUrl}/categories`, options);
  }

  createCategory(body: SaveCategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(`${environment.apiUrl}/categories`, body);
  }

  updateCategory(id: string, body: SaveCategoryDto): Observable<CategoryDto> {
    return this.http.patch<CategoryDto>(`${environment.apiUrl}/categories/${id}`, body);
  }

  createGroup(body: SaveBudgetGroupDto): Observable<BudgetGroupSettingsDto> {
    return this.http.post<BudgetGroupSettingsDto>(`${environment.apiUrl}/budget-groups`, body);
  }

  updateGroup(id: string, body: SaveBudgetGroupDto): Observable<BudgetGroupSettingsDto> {
    return this.http.patch<BudgetGroupSettingsDto>(
      `${environment.apiUrl}/budget-groups/${id}`,
      body,
    );
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/budget-groups/${id}`);
  }
}
