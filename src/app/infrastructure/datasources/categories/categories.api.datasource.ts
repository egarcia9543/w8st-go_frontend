import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CategoryCatalogDto } from '../../models/category.dto';

@Injectable({ providedIn: 'root' })
export class CategoriesApiDatasource {
  private readonly http = inject(HttpClient);

  getCatalog(): Observable<CategoryCatalogDto> {
    return this.http.get<CategoryCatalogDto>(`${environment.apiUrl}/categories`);
  }
}
